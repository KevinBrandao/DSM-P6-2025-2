import { AvaliacaoSonoRepository } from './../repositories/AvaliacaoSonoRepository';
import { AvaliacaoRepository } from "../repositories/AvaliacaoRepository";
import { MedicoRepository } from "../repositories/MedicoRepository";

export class HistoricoService {
	private avaliacaoRepository: AvaliacaoRepository;
	private medicoRepository: MedicoRepository;
	private avaliacaoSonoRepository: AvaliacaoSonoRepository;

	constructor() {
		this.avaliacaoRepository = new AvaliacaoRepository();
		this.medicoRepository = new MedicoRepository();
		this.avaliacaoSonoRepository = new AvaliacaoSonoRepository();
	}

	async getHistoricoByMedicoId(medicoId: string) {
		// Verificar se o médico existe
		const medico = await this.medicoRepository.findById(medicoId);
		if (!medico) {
			throw new Error("Médico não encontrado");
		}

		// Buscar avaliações do médico
		const avaliacoes = await this.avaliacaoRepository.findByMedicoId(
			medicoId
		);

		// Formatar para o formato esperado pela API
		return avaliacoes.map((avaliacao) => ({
			id: avaliacao.id,
			data: avaliacao.data,
			resultado: avaliacao.resultado,
			questionario: avaliacao.questionario,
		}));
	}

	async getHistoricoSonoByMedicoId(medicoId: string) {
		// Verificar se o médico existe
		const medico = await this.medicoRepository.findById(medicoId);
		if (!medico) {
			throw new Error("Médico não encontrado");
		}

		// Buscar avaliações do médico
		const avaliacoes = await this.avaliacaoSonoRepository.findByMedicoId(
			medicoId
		);

		// Formatar para o formato esperado pela API
		return avaliacoes.map((avaliacao) => ({
			id: avaliacao.id,
			data: avaliacao.data,
			resultado: avaliacao.resultado,
			questionario: avaliacao.questionario,
		}));
	}
}
