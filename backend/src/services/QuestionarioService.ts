// src/services/QuestionarioService.ts

import { v4 as uuidv4 } from "uuid";
import { IQuestionario, IResultado } from "../models/interfaces/IQuestionario";
import { AvaliacaoRepository } from "../repositories/AvaliacaoRepository";
import { MedicoRepository } from "../repositories/MedicoRepository";
import { QuestionarioRepository } from "../repositories/QuestionarioRepository";
import { NatsService } from "./NatsService"; // 1. Importar o NatsService

export class QuestionarioService {
	private questionarioRepository: QuestionarioRepository;
	private avaliacaoRepository: AvaliacaoRepository;
	private medicoRepository: MedicoRepository;
	private natsService: NatsService; // 2. Adicionar instância do NatsService

	constructor() {
		this.questionarioRepository = new QuestionarioRepository();
		this.avaliacaoRepository = new AvaliacaoRepository();
		this.medicoRepository = new MedicoRepository();
		// 3. Obter a instância Singleton do NatsService
		this.natsService = NatsService.getInstance();
	}

	/**
	 * Inicia o processo de análise de forma assíncrona.
	 * Salva o questionário, publica uma mensagem no NATS para o serviço de IA
	 * e retorna o registro inicial com status 'PENDING'.
	 *
	 * @param questionarioData Os dados do questionário.
	 * @param medicoId O ID do médico autenticado.
	 * @returns O registro do questionário salvo.
	 */
	async startAnalysis(
		questionarioData: IQuestionario,
		medicoId: string
	): Promise<any> {
		// O retorno agora é o questionário salvo
		// Validar se o serviço de mensageria está disponível
		if (!this.natsService.isConnected()) {
			throw new Error(
				"Serviço de análise indisponível no momento. Tente novamente mais tarde."
			);
		}

		// Validar se o médico existe
		const medico = await this.medicoRepository.findById(medicoId);
		if (!medico) {
			throw new Error("Médico não encontrado");
		}

		// Gerar um ID único para rastrear todo o fluxo da requisição
		const requestId = uuidv4();

		// Salvar o questionário no banco de dados
		const questionario = await this.questionarioRepository.create(
			questionarioData
		);

		// Criar a avaliação inicial com status PENDING
		const avaliacao = await this.avaliacaoRepository.create({
			resultado: -1, // Usar -1 para indicar 'Pendente' (0=Baixo, 1=Alto)
			recomendacao: "Análise em processamento...",
			medicoId,
			questionarioId: questionario.id,
			// requestId, // Salvar o requestId para vincular a resposta do NATS
		});

		try {
			// Extrair os dados para o modelo de IA
			const modelInput =
				this.extractModelInputFromQuestionario(questionarioData);

			// Montar o payload da mensagem para o NATS
			const messagePayload = {
				// requestId,
				requestId: avaliacao.id,
				data: modelInput, // Enviar o array de números diretamente
			};

			// Publicar a mensagem no NATS para ser consumida pelo serviço de IA
			await this.natsService.publish("analyses.request", messagePayload);

			// Retornar a avaliação inicial para o controller
			return {
				message:
					"Sua solicitação foi recebida e está sendo processada. O resultado estará disponível em breve no seu histórico.",
				avaliacao,
			};
		} catch (error) {
			// Em caso de falha ao publicar, atualizar a avaliação para 'FAILED'
			avaliacao.resultado = -2; // -2 para 'Falha'
			avaliacao.recomendacao =
				"Ocorreu um erro ao enfileirar a análise para processamento.";
			await this.avaliacaoRepository.save(avaliacao);

			console.error("Falha ao publicar no NATS:", error);
			throw new Error("Ocorreu um erro ao iniciar a análise.");
		}
	}

	// Este método permanece o mesmo, pois é usado para preparar os dados para a IA
	private extractModelInputFromQuestionario(
		questionario: IQuestionario
	): number[] {
		return [
			questionario.age,
			questionario.restingBloodPressure,
			questionario.serumCholesterol,
			questionario.maxHeartRate,
			questionario.oldpeak,
			questionario.sex,
			questionario.chestPainType,
			questionario.fastingBloodSugar,
			questionario.restingECG,
			questionario.exerciseAngina,
			questionario.stSlope,
		];
	}

	// Este método agora será usado pelo consumidor de resultados
	public generateRecommendation(
		resultado: number,
		data: IQuestionario
	): string {
		if (resultado === 1) {
			return "Paciente apresenta alto risco de doença cardíaca. Recomenda-se avaliação cardiológica completa, incluindo exames complementares como ecocardiograma e teste ergométrico. Considerar ajustes no estilo de vida e medicação preventiva.";
		} else {
			let recomendacao =
				"Paciente apresenta baixo risco de doença cardíaca. ";
			if (data.restingBloodPressure > 120)
				recomendacao += "Monitorar pressão arterial regularmente. ";
			if (data.serumCholesterol > 180)
				recomendacao +=
					"Considerar ajustes na dieta para controle do colesterol. ";
			if (data.age > 50)
				recomendacao +=
					"Realizar check-up cardiológico anual devido à idade. ";
			return (
				recomendacao +
				"Manter hábitos saudáveis e atividade física regular."
			);
		}
	}
}
