// src/services/ResultConsumerService.ts

import { AvaliacaoRepository } from '../repositories/AvaliacaoRepository';
import { QuestionarioRepository } from '../repositories/QuestionarioRepository';
import { NatsService } from './NatsService';
import { QuestionarioService } from './QuestionarioService';

export class ResultConsumerService {
    private natsService: NatsService;
    private avaliacaoRepository: AvaliacaoRepository;
    private questionarioRepository: QuestionarioRepository;
    private questionarioService: QuestionarioService; // Para reutilizar a lógica de recomendação

    constructor() {
        this.natsService = NatsService.getInstance();
        this.avaliacaoRepository = new AvaliacaoRepository();
        this.questionarioRepository = new QuestionarioRepository();
        this.questionarioService = new QuestionarioService();
    }

    /**
     * Inicia o consumidor para ouvir os resultados de análises do NATS.
     */
    public async start() {
        if (!this.natsService.isConnected()) {
            console.error('Não foi possível iniciar o consumidor de resultados, o NATS não está conectado.');
            return;
        }

        console.log('Iniciando o consumidor de resultados de análises...');

        // Assina o tópico de resultados concluídos
        await this.natsService.subscribe(
            'results.completed',
            'RESULTS',
            'api_results_consumer', // Nome durável
            this.handleCompletedResult.bind(this) // Usa o método de tratamento
        );
    }

    /**
     * Manipula uma mensagem de resultado concluído recebida do NATS.
     * @param data O payload da mensagem.
     */
    private async handleCompletedResult(data: { requestId: string; result: number }) {
        console.log(`Resultado recebido para a requisição ${data.requestId}: ${data.result}`);
        try {
            // 1. Encontrar a avaliação pelo requestId
            const avaliacao = await this.avaliacaoRepository.findById(data.requestId);
            if (!avaliacao) {
                console.error(`Avaliação com requestId ${data.requestId} não encontrada.`);
                // Lançar erro fará a mensagem ser reenviada (NAK)
                throw new Error('Avaliação não encontrada.');
            }

            // 2. Encontrar o questionário original para gerar a recomendação
            const questionario = await this.questionarioRepository.findById(avaliacao.questionarioId);
            if (!questionario) {
                throw new Error('Questionário associado não encontrado.');
            }

            // 3. Gerar a recomendação usando a lógica já existente no QuestionarioService
            const recomendacao = this.questionarioService.generateRecommendation(
                data.result,
                questionario
            );

            // 4. Atualizar a avaliação com o resultado final e a recomendação
            await this.avaliacaoRepository.save({...avaliacao,
                resultado: data.result,
                recomendacao: recomendacao,
            });

            console.log(`Avaliação ${avaliacao.id} (requestId: ${data.requestId}) atualizada com sucesso.`);
            // Aqui, no futuro, você poderia publicar em outro tópico para notificar o usuário via WebSocket.

        } catch (dbError) {
            console.error(`Falha ao processar o resultado para a requisição ${data.requestId}:`, dbError);
            // Lançar o erro garante que o NATS tentará reentregar a mensagem
            throw dbError;
        }
    }
}