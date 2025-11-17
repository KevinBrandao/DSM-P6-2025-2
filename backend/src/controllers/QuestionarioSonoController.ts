import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { QuestionarioSonoService } from "../services/QuestionarioSonoService";

export class QuestionarioSonoController {
<<<<<<< HEAD
    async process(req: Request, res: Response): Promise<void> {
        // try {
        //     // Verificar erros de validação
        //     const errors = validationResult(req);
        //     if (!errors.isEmpty()) {
        //         res.status(400).json({
        //             success: false,
        //             errors: errors.array()
        //         });
        //         return;
        //     }

        //     const data: QuestionarioSonoRequest = req.body;
        //     const requestId = this.generateRequestId();
        //     const natsAvailable = req.natsAvailable;

        //     let predictionResult: number;

        //     if (natsAvailable) {
        //         try {
        //             // Tentar usar NATS se disponível
        //             predictionResult = await this.sendToAnalysisService(data, requestId);
        //         } catch (error) {
        //             console.log(`[${requestId}] NATS falhou, usando predição local`);
        //             predictionResult = await this.localPrediction(data);
        //         }
        //     } else {
        //         // Usar predição local
        //         predictionResult = await this.localPrediction(data);
        //         console.log(`[${requestId}] Predição local executada. Resultado: ${predictionResult}`);
        //     }

        //     // Interpretar o resultado
        //     const interpretacao = this.interpretarResultado(predictionResult);
            
        //     // Gerar recomendações baseadas no resultado
        //     const recomendacoes = this.gerarRecomendacoes(data, predictionResult);

        //     res.status(200).json({
        //         success: true,
        //         data: {
        //             requestId,
        //             resultado: predictionResult,
        //             interpretacao,
        //             recomendacoes,
        //             dadosAnalisados: this.formatarDadosAnalisados(data),
        //             modo: natsAvailable ? "NATS" : "Local"
        //         }
        //     });

        // } catch (error) {
        //     console.error("Erro ao processar questionário de sono:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "Erro interno do servidor ao processar análise do sono"
        //     });
        // }
    }

    private async sendToAnalysisService(data: QuestionarioSonoRequest, requestId: string): Promise<number> {
        // Se você quiser implementar NATS posteriormente, coloque aqui
        // Por enquanto, vamos simular uma falha para usar o modo local
        throw new Error("NATS não implementado - usando predição local");
    }

    private async localPrediction(data: QuestionarioSonoRequest): Promise<number> {
        // Algoritmo de predição local baseado nos dados
        let score = 0;

        // Duração do sono (0-3 pontos)
        if (data["Sleep Duration"] < 6) score += 3;
        else if (data["Sleep Duration"] < 7) score += 2;
        else if (data["Sleep Duration"] > 9) score += 1;

        // Qualidade do sono (0-3 pontos)
        if (data["Quality of Sleep"] <= 3) score += 3;
        else if (data["Quality of Sleep"] <= 5) score += 2;
        else if (data["Quality of Sleep"] <= 7) score += 1;

        // Nível de estresse (0-3 pontos)
        if (data["Stress Level"] >= 8) score += 3;
        else if (data["Stress Level"] >= 6) score += 2;
        else if (data["Stress Level"] >= 4) score += 1;

        // Atividade física (0-2 pontos)
        if (data["Physical Activity Level"] < 20) score += 2;
        else if (data["Physical Activity Level"] < 40) score += 1;

        // Passos diários (0-2 pontos)
        if (data["Daily Steps"] < 3000) score += 2;
        else if (data["Daily Steps"] < 5000) score += 1;

        // Categoria BMI (0-3 pontos)
        if (data["BMI Category"] === "Obese") score += 3;
        else if (data["BMI Category"] === "Overweight") score += 2;
        else if (data["BMI Category"] === "Underweight") score += 1;

        // Pressão arterial (0-2 pontos)
        const [systolic, diastolic] = data["Blood Pressure"].split('/').map(Number);
        if (systolic > 140 || diastolic > 90) score += 2;
        else if (systolic > 130 || diastolic > 85) score += 1;

        // Frequência cardíaca (0-1 ponto)
        if (data["Heart Rate"] > 100 || data["Heart Rate"] < 50) score += 1;

        // Idade (fator de risco - 0-1 ponto)
        if (data.Age > 50) score += 1;

        // Determinar resultado baseado no score
        if (score >= 10) return 2; // Distúrbio severo
        if (score >= 6) return 1;  // Distúrbio moderado
        return 0;                  // Sem distúrbio
    }

    private interpretarResultado(resultado: number): any {
        const interpretacoes = {
            0: {
                nivel: "Sem distúrbio significativo",
                descricao: "Seu padrão de sono parece dentro dos parâmetros saudáveis. Continue mantendo bons hábitos de sono.",
                gravidade: "Baixa",
                cor: "green"
            },
            1: {
                nivel: "Distúrbio moderado",
                descricao: "Alguns indicadores sugerem possíveis problemas de sono que merecem atenção. Recomenda-se ajustes no estilo de vida.",
                gravidade: "Média",
                cor: "orange"
            },
            2: {
                nivel: "Distúrbio severo",
                descricao: "Múltiplos indicadores apontam para distúrbios significativos do sono. Recomenda-se avaliação médica especializada.",
                gravidade: "Alta",
                cor: "red"
=======
    private questionarioService: QuestionarioSonoService;

    constructor() {
        this.questionarioService = new QuestionarioSonoService();
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
>>>>>>> fef86bd4023968b53319a74631eaac6a783e77d9
            }
            return res
                .status(500)
                .json({ error: "Erro ao processar questionário" });
        }
    }

    // Outros métodos do controller (ex: getHistorico) permanecem os mesmos
}