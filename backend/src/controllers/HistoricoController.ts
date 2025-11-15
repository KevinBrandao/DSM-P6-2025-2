import { Request, Response } from "express";
import { HistoricoService } from "../services/HistoricoService";

export class HistoricoController {
	private historicoService: HistoricoService;

	constructor() {
		this.historicoService = new HistoricoService();
	}

	async getHistorico(req: Request, res: Response) {
		try {
			const medicoId = req.userId; // Vem do middleware de autenticação

			const historico =
				await this.historicoService.getHistoricoByMedicoId(medicoId);

			return res.json(historico);
		} catch (error) {
			if (error instanceof Error) {
				return res.status(400).json({ error: error.message });
			}
			return res.status(500).json({ error: "Erro ao buscar histórico" });
		}
	}

	async getHistoricoSono(req: Request, res: Response) {
		try {
			const medicoId = req.userId; // Vem do middleware de autenticação

			const historicoSono =
				await this.historicoService.getHistoricoSonoByMedicoId(
					medicoId
				);

			return res.json(historicoSono);
		} catch (error) {
			if (error instanceof Error) {
				return res.status(400).json({ error: error.message });
			}
			return res
				.status(500)
				.json({ error: "Erro ao buscar histórico de sono" });
		}
	}
}
