import { v4 as uuidv4 } from "uuid";
import { IQuestionarioSono } from "../models/interfaces/IQuestionarioSono";
import { AvaliacaoSonoRepository } from "../repositories/AvaliacaoSonoRepository";
import { MedicoRepository } from "../repositories/MedicoRepository";
import { QuestionarioSonoRepository } from "../repositories/QuestionarioSonoRepository";
import { NatsService } from "./NatsService";

export class QuestionarioSonoService {
	private questionarioSonoRepository: QuestionarioSonoRepository;
	private avaliacaoSonoRepository: AvaliacaoSonoRepository;
	private medicoRepository: MedicoRepository;
	private natsService: NatsService;

	constructor() {
		this.questionarioSonoRepository = new QuestionarioSonoRepository();
		this.avaliacaoSonoRepository = new AvaliacaoSonoRepository();
		this.medicoRepository = new MedicoRepository();
		this.natsService = NatsService.getInstance();
	}

	/**
	 * Inicia o processo de análise do questionário de sono de forma assíncrona.
	 * Valida médico e mensageria, salva o questionário, cria avaliação inicial,
	 * e publica no NATS para análise pelo modelo de IA.
	 */
	async startAnalysis(
		questionarioData: IQuestionarioSono,
		medicoId: string
	): Promise<any> {
		if (!this.natsService.isConnected()) {
			throw new Error(
				"Serviço de análise de sono indisponível no momento. Tente novamente mais tarde."
			);
		}

		// Verifica se o médico existe
		const medico = await this.medicoRepository.findById(medicoId);
		if (!medico) {
			throw new Error("Médico não encontrado");
		}

		const requestId = uuidv4();

		// Salvar o questionário de sono
		const questionarioSono = await this.questionarioSonoRepository.create(
			questionarioData
		);

		// Criar a avaliação inicial com status PENDING
		const avaliacao = await this.avaliacaoSonoRepository.create({
			resultado: -1, // -1 = pendente
			recomendacao: "Análise do sono em processamento...",
			medicoId,
			questionarioId: questionarioSono.id,
		});


		try {
			// Extrair os dados para o modelo de IA
			const modelInput =
				this.extractModelInputFromQuestionario(questionarioData);

			const messagePayload = {
				requestId: avaliacao.id,
				data: modelInput,
			};

			console.log(messagePayload);

			// Publicar no NATS
			await this.natsService.publish("analyses.sleep.request", messagePayload);

			return {
				message:
					"Sua solicitação de análise de sono foi recebida e está sendo processada. O resultado estará disponível em breve no histórico.",
				avaliacao,
			};
		} catch (error) {
			avaliacao.resultado = -2;
			avaliacao.recomendacao =
				"Ocorreu um erro ao enfileirar a análise de sono.";
			await this.avaliacaoSonoRepository.save(avaliacao);

			console.error("Falha ao publicar no NATS (sono):", error);
			throw new Error("Erro ao iniciar a análise do questionário de sono.");
		}
	}

	// Este método permanece o mesmo, pois é usado para preparar os dados para a IA
		private extractModelInputFromQuestionario(
			questionario: IQuestionarioSono
		): any[] {
			return [
				Number(questionario.gender) === 0 ? "Female" : "Male",
				Number(questionario.age),
				questionario.occupation,
				Number(questionario.sleepDuration),
				Number(questionario.qualityOfSleep),
				Number(questionario.physicalActivityLevel),
				Number(questionario.stressLevel),
				questionario.bmiCategory,
				questionario.bloodPressure,
				Number(questionario.heartRate),
				Number(questionario.dailySteps),
			];
		}
	

	/**
	 * Gera recomendações com base no resultado da análise de IA
	 */
	public generateRecommendation(
		resultado: number,
		data: IQuestionarioSono
	): string {
		if (resultado === 1) {
			return "Análise indica padrões de sono insatisfatórios e possível distúrbio do sono. Recomenda-se encaminhar o paciente para avaliação especializada e considerar exames como polissonografia. Orientar sobre higiene do sono e redução de estresse.";
		} else {
			let recomendacao = "Padrões de sono dentro da normalidade. ";
			if (data.sleepDuration < 6)
				recomendacao += "Incentivar aumento da duração do sono para 7–8 horas. ";
			if (data.qualityOfSleep < 6)
				recomendacao += "Reforçar boas práticas de higiene do sono. ";
			if (data.stressLevel > 6)
				recomendacao += "Avaliar estratégias para manejo do estresse. ";
			if (data.physicalActivityLevel < 4)
				recomendacao += "Estimular aumento gradual da atividade física. ";
			return recomendacao + "Manter rotina equilibrada e sono regular.";
		}
	}
}