import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { QuestionarioSonoService } from "../services/QuestionarioSonoService";

export class QuestionarioSonoController {
    private questionarioSonoService: QuestionarioSonoService;

    constructor() {
        this.questionarioSonoService = new QuestionarioSonoService();
    }

    async process(req: Request, res: Response) {
        try {
            // Validação de campos (usando express-validator no middleware)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const questionarioSonoData = req.body;
            const medicoId = req.userId; // vindo do middleware de autenticação

            // Inicia o processamento/armazenamento do questionário de sono
            const resultadoInicial =
                await this.questionarioSonoService.startAnalysis(
                    questionarioSonoData,
                    medicoId
                );

            // Retorna resposta imediata (HTTP 202 Accepted)
            return res.status(202).json(resultadoInicial);

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('indisponível')) {
                    return res.status(503).json({ error: error.message });
                }
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({ error: "Erro ao processar questionário de sono" });
        }
    }

    // Exemplo de outro método: obter histórico de questionários de sono
    async getHistorico(req: Request, res: Response) {
        try {
            const medicoId = req.userId;
            const historico = await this.questionarioSonoService.getHistorico(medicoId);
            return res.status(200).json(historico);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar histórico" });
        }
    }
}