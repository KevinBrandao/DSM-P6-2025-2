import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { QuestionarioService } from "../services/QuestionarioService";

export class QuestionarioController {
    private questionarioService: QuestionarioService;

    constructor() {
        this.questionarioService = new QuestionarioService();
    }

    async process(req: Request, res: Response) {
        try {
            // Validar entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const questionarioData = req.body;
            const medicoId = req.userId; // Vem do middleware de autenticação

            // Chama o método que inicia a análise assíncrona
            const resultadoInicial =
                await this.questionarioService.startAnalysis(
                    questionarioData,
                    medicoId
                );

            // Retorna uma resposta imediata para o cliente (HTTP 202 Accepted)
            return res.status(202).json(resultadoInicial);

        } catch (error) {
            if (error instanceof Error) {
                // Captura erros específicos, como a indisponibilidade do NATS
                if (error.message.includes('indisponível')) {
                    return res.status(503).json({ error: error.message });
                }
                return res.status(400).json({ error: error.message });
            }
            return res
                .status(500)
                .json({ error: "Erro ao processar questionário" });
        }
    }

    // Outros métodos do controller (ex: getHistorico) permanecem os mesmos
}