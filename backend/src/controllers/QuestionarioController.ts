import { Request, Response } from "express";
import { QuestionarioService } from "../services/QuestionarioService";
import { validationResult } from "express-validator";

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

            const resultado =
                await this.questionarioService.processQuestionario(
                    questionarioData,
                    medicoId
                );

            return res.json(resultado);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res
                .status(500)
                .json({ error: "Erro ao processar questionário" });
        }
    }
}
