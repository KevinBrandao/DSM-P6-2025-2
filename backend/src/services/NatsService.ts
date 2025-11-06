import {
	connect,
	NatsConnection,
	JetStreamClient,
	JetStreamManager,
	StringCodec,
	JetStreamSubscription,
	AckPolicy,
	consumerOpts,
	createInbox,
	StorageType,
	RetentionPolicy,
	ConsumerConfig,
	DeliverPolicy,
} from "nats";

/**
 * @interface NatsConfig
 * @description Interface para configurar o serviço NATS.
 */
export interface NatsConfig {
	servers: string | string[];
	connectionName?: string;
	maxReconnectAttempts?: number;
	reconnectTimeWait?: number;
	timeout?: number;
}

/**
 * @class NatsService
 * @description Um serviço NATS em TypeScript que implementa o padrão Singleton
 * para gerenciar uma única conexão NATS e JetStream.
 */
export class NatsService {
	private static _instance: NatsService;
	private nc: NatsConnection | null = null;
	private js: JetStreamClient | null = null;
	private jsm: JetStreamManager | null = null;
	private readonly sc = StringCodec();
	private readonly config: NatsConfig;

	/**
	 * Construtor privado para implementar o padrão Singleton.
	 * @param {NatsConfig} config - Configurações de conexão NATS.
	 */
	private constructor(config: NatsConfig) {
		this.config = config;
	}

	/**
	 * Retorna a única instância do NatsService. Se não existir, cria uma nova.
	 * @param {NatsConfig} config - Configurações de conexão NATS.
	 * @returns {NatsService} A instância Singleton do NatsService.
	 */
	public static getInstance(config?: NatsConfig): NatsService {
		if (!NatsService._instance) {
            if (!config || !config.servers) {
                throw new Error("NATS: Configuração inválida. 'servers' é obrigatório na primeira inicialização.");
            }
			NatsService._instance = new NatsService(config);
		}
		return NatsService._instance;
	}

	/**
	 * Conecta ao servidor NATS e inicializa o JetStream.
	 * Garante que os streams necessários ('ANALYSES' e 'RESULTS') existam.
	 * @async
	 * @returns {Promise<void>} Uma Promessa que resolve quando a conexão e a configuração estão completas.
	 * @throws {Error} Lança um erro se a conexão falhar.
	 */
	public async connect(): Promise<void> {
		if (this.nc && !this.nc.isClosed()) {
			console.log("NATS: Já conectado.");
			return;
		}

		try {
			console.log(`NATS: Tentando conectar a ${this.config.servers}...`);
			this.nc = await connect(this.config);
			this.js = this.nc.jetstream();
			this.jsm = await this.nc.jetstreamManager();

			console.log(`NATS: Conectado ao servidor ${this.nc.getServer()}.`);

			this.setupConnectionEventHandlers();
			await this.ensureStreamsExist();
		} catch (error) {
			console.error(
				`NATS: Falha ao conectar ou configurar JetStream:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Configura os manipuladores de eventos para o estado da conexão NATS.
	 * @private
	 */
	private setupConnectionEventHandlers(): void {
		if (!this.nc) return;

		(async () => {
			// Usar `nc.closed()` para escutar eventos de fechamento
			for await (const s of this.nc!.status()) {
				switch (s.type) {
					case "disconnect":
						console.warn(`NATS: Desconectado: ${s.data}`);
						break;
					case "reconnecting":
						console.log(`NATS: Reconectando...`);
						break;
					case "reconnect":
						console.log(
							`NATS: Reconectado ao servidor ${this.nc!.getServer()}.`
						);
						break;
					case "error":
						console.error(`NATS: Erro de conexão: ${s.data}`);
						break;
					case "ldm":
						console.warn(
							"NATS: Modo de entrega de baixa latência ativado."
						);
						break;
					// case "drain":
					// 	console.log("NATS: Conexão sendo drenada.");
					// 	break;
					// case "close":
					// 	console.log("NATS: Conexão fechada.");
					// 	break;
					default:
						console.log(
							`NATS: Status: ${s.type} - ${JSON.stringify(
								s.data
							)}`
						);
						break;
				}
			}
		})();
	}

	/**
	 * Garante que os streams JetStream 'ANALYSES' e 'RESULTS' existam, criando-os se necessário.
	 * @async
	 * @private
	 */
	private async ensureStreamsExist(): Promise<void> {
		if (!this.jsm) {
			throw new Error("JetStreamManager não está inicializado.");
		}

		// Configuração para o stream ANALYSES
		const analysesStreamConfig = {
			name: "ANALYSES",
			subjects: ["analyses.request"],
			retention: RetentionPolicy.Workqueue, // Mensagens são removidas após serem ack'd por um consumidor
			storage: StorageType.File,
			max_consumers: -1, // Sem limite de consumidores
			max_msgs_per_subject: 100000, // Limite de mensagens por assunto para evitar sobrecarga
			max_bytes: 1024 * 1024 * 1024, // 1GB de armazenamento
			num_replicas: 1, // Para ambientes de produção, considere 3 ou mais para alta disponibilidade
		};

		// Configuração para o stream RESULTS
		const resultsStreamConfig = {
			name: "RESULTS",
			subjects: ["results.completed", "results.failed"],
			retention: RetentionPolicy.Limits, // Retenção baseada em limites (tempo, mensagens, bytes)
			max_age: 1000 * 60 * 60 * 24 * 7, // 7 dias
			storage: StorageType.File,
			max_consumers: -1,
			num_replicas: 1,
		};

		console.log("NATS JetStream: Verificando e criando streams...");

		try {
			// Verificar e criar ANALYSES stream
			await this.jsm.streams.info("ANALYSES");
			console.log("NATS JetStream: Stream ANALYSES já existe.");
		} catch (e) {
			console.log("NATS JetStream: Criando stream ANALYSES...");
			await this.jsm.streams.add(analysesStreamConfig);
			console.log("NATS JetStream: Stream ANALYSES criado com sucesso.");
		}

		try {
			// Verificar e criar RESULTS stream
			await this.jsm.streams.info("RESULTS");
			console.log("NATS JetStream: Stream RESULTS já existe.");
		} catch (e) {
			console.log("NATS JetStream: Criando stream RESULTS...");
			await this.jsm.streams.add(resultsStreamConfig);
			console.log("NATS JetStream: Stream RESULTS criado com sucesso.");
		}
	}

	/**
	 * Publica uma mensagem JSON em um determinado assunto do JetStream.
	 * @async
	 * @param {string} subject - O assunto onde a mensagem será publicada (ex: 'analyses.request').
	 * @param {object} data - O objeto de dados a ser publicado, será serializado para JSON.
	 * @returns {Promise<void>} Uma Promessa que resolve quando a mensagem é publicada.
	 * @throws {Error} Lança um erro se a conexão não estiver ativa ou a publicação falhar.
	 */
	public async publish(subject: string, data: object): Promise<void> {
		if (!this.js || !this.nc || this.nc.isClosed()) {
			throw new Error(
				"NATS: Serviço não conectado ou fechado. Não é possível publicar."
			);
		}

		try {
			const payload = this.sc.encode(JSON.stringify(data));
			await this.js.publish(subject, payload);
			console.log(
				`NATS: Mensagem publicada no assunto '${subject}': ${JSON.stringify(
					data
				)}`
			);
		} catch (error) {
			console.error(
				`NATS: Falha ao publicar no assunto '${subject}':`,
				error
			);
			throw error;
		}
	}

	/**
	 * Inscreve-se em um assunto JetStream para receber mensagens, processando-as com um callback.
	 * Utiliza um consumidor push durável para garantir que as mensagens não sejam perdidas
	 * e sejam confirmadas explicitamente.
	 * @async
	 * @param {string} subject - O assunto JetStream para o qual se inscrever (ex: 'analyses.request').
	 * @param {string} streamName - O nome do stream onde o assunto está localizado (ex: 'ANALYSES').
	 * @param {string} durableName - Um nome durável único para este consumidor. Essencial para que o NATS
	 *                             rastreie o progresso do consumidor.
	 * @param {(data: object) => Promise<void>} callback - A função assíncrona a ser chamada com os dados
	 *                                                    da mensagem. Deve retornar uma Promise.
	 * @returns {Promise<JetStreamSubscription>} Uma Promessa que resolve com a Subscription ativa.
	 * @throws {Error} Lança um erro se a conexão não estiver ativa ou a inscrição falhar.
	 */
	public async subscribe(
		subject: string,
		streamName: string,
		durableName: string,
		callback: (data: any) => Promise<void>
	): Promise<JetStreamSubscription> {
		if (!this.js || !this.nc || this.nc.isClosed()) {
			throw new Error(
				"NATS: Serviço não conectado ou fechado. Não é possível subscrever."
			);
		}

		try {
			const opts = consumerOpts();
			opts.durable(durableName); // Nome durável para o consumidor
			opts.ackExplicit(); // Requer ACK explícito
			opts.deliverTo(createInbox()); // Inbox privado para este consumidor push
			opts.maxAckPending(10); // Número máximo de mensagens pendentes de ACK
			opts.manualAck(); // Permite controle manual de ACK
			// opts.deliverPolicy(DeliverPolicy.New); // Começa a receber novas mensagens
			opts.maxDeliver(5); // Retentativas máximas antes de mover para o Dead Letter Stream (DLQ)

			// Se o stream for WorkQueue, NATS garante que apenas um consumidor receba.
			// Para um grupo de consumidores, usar opts.queue('my_queue_group');
			// No entanto, para WorkQueue stream, o NATS já gerencia a entrega de uma vez.

			const sub = await this.js.subscribe(subject, opts);
			console.log(
				`NATS: Subscrito no assunto '${subject}' no stream '${streamName}' com consumidor durável '${durableName}'.`
			);

			(async () => {
				for await (const msg of sub) {
					try {
						const data = JSON.parse(this.sc.decode(msg.data));
						console.log(
							`NATS: Mensagem recebida em '${subject}' (Seq: ${
								msg.seq
							}): ${JSON.stringify(data)}`
						);

						await callback(data); // Processa a mensagem
						msg.ack(); // Confirma o processamento bem-sucedido
						console.log(
							`NATS: Mensagem ACK em '${subject}' (Seq: ${msg.seq}).`
						);
					} catch (processingError) {
						console.error(
							`NATS: Erro ao processar mensagem em '${subject}' (Seq: ${msg.seq}):`,
							processingError
						);
						// Nack a mensagem para reentrega. O JetStream vai reentregar conforme maxDeliver
						// Se maxDeliver for excedido, a mensagem pode ser movida para um DLQ ou descartada.
						// msg.nak() reentrega a mensagem após um tempo.
						// msg.term() termina a mensagem, movendo-a para o DLQ (se configurado no consumer).
						msg.nak();
						console.log(
							`NATS: Mensagem NAK em '${subject}' (Seq: ${msg.seq}). Será reentregue.`
						);
					}
				}
				console.log(`NATS: Inscrição em '${subject}' fechada.`);
			})();

			return sub;
		} catch (error) {
			console.error(
				`NATS: Falha ao subscrever no assunto '${subject}':`,
				error
			);
			throw error;
		}
	}

	/**
	 * Fecha a conexão NATS de forma graciosa, drenando todas as mensagens pendentes.
	 * @async
	 * @returns {Promise<void>} Uma Promessa que resolve quando a conexão é fechada.
	 */
	public async close(): Promise<void> {
		if (this.nc && !this.nc.isClosed()) {
			console.log("NATS: Drenando e fechando conexão...");
			await this.nc.drain(); // Drena mensagens pendentes antes de fechar
			await this.nc.close();
			this.nc = null;
			this.js = null;
			this.jsm = null;
			console.log("NATS: Conexão fechada.");
		} else {
			console.log("NATS: Conexão já estava fechada ou não estabelecida.");
		}
	}

	/**
	 * Retorna o status da conexão NATS.
	 * @returns {boolean} True se a conexão estiver ativa, false caso contrário.
	 */
	public isConnected(): boolean {
		return this.nc !== null && !this.nc.isClosed() && !this.nc.isDraining();
	}
}

// Exemplo de uso:
/*
(async () => {
  // Configurações do NATS. Idealmente carregadas de variáveis de ambiente.
  const natsConfig: NatsConfig = {
    servers: process.env.NATS_URL || 'nats://localhost:4222',
    connectionName: 'api_backend_service',
    maxReconnectAttempts: 10,
    reconnectTimeWait: 5000, // 5 segundos
    timeout: 10000, // 10 segundos
  };

  const natsService = NatsService.getInstance(natsConfig);

  try {
    await natsService.connect();

    // Exemplo de Publisher: Publica uma nova solicitação de análise
    await natsService.publish('analyses.request', {
      requestId: 'REQ-12345',
      patientId: 'PAT-67890',
      data: { age: 45, sex: 1, cp: 0, trestbps: 120, chol: 200, fbs: 0, restecg: 1, thalach: 150, exang: 0, oldpeak: 1.0, slope: 2, ca: 0, thal: 2 },
      timestamp: new Date().toISOString(),
    });

    // Exemplo de Consumer: Ouvindo por resultados de análises concluídas
    await natsService.subscribe(
      'results.completed',
      'RESULTS',
      'api_results_consumer', // Nome durável único para este consumidor
      async (data) => {
        console.log(`API: Recebido resultado de análise: ${JSON.stringify(data)}`);
        // Lógica para atualizar o banco de dados com o resultado
        // Ex: `await updateAnalysisStatusInDB(data.requestId, data.result);`
      }
    );

    // Opcional: Manter o processo ativo por um tempo para demonstração
    // console.log('Serviço rodando. Pressione Ctrl+C para sair.');
    // await new Promise(resolve => setTimeout(resolve, 60000)); // Espera 60 segundos
    // await natsService.close();

  } catch (error) {
    console.error('Falha geral no serviço NATS:', error);
    process.exit(1);
  } finally {
    // Garante que a conexão seja fechada ao sair
    // process.on('SIGINT', async () => {
    //   await natsService.close();
    //   process.exit(0);
    // });
    // process.on('SIGTERM', async () => {
    //   await natsService.close();
    //   process.exit(0);
    // });
  }
})();
*/
