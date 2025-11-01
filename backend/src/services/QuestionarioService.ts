import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import { QuestionarioRepository } from "../repositories/QuestionarioRepository";
import { AvaliacaoRepository } from "../repositories/AvaliacaoRepository";
import { IQuestionario, IResultado } from "../models/interfaces/IQuestionario";
import { MedicoRepository } from "../repositories/MedicoRepository";

export class QuestionarioService {
    private questionarioRepository: QuestionarioRepository;
    private avaliacaoRepository: AvaliacaoRepository;
    private medicoRepository: MedicoRepository;

    constructor() {
        this.questionarioRepository = new QuestionarioRepository();
        this.avaliacaoRepository = new AvaliacaoRepository();
        this.medicoRepository = new MedicoRepository();
    }

    async processQuestionario(
        questionarioData: IQuestionario,
        medicoId: string
    ): Promise<IResultado> {
        // Validar se o médico existe
        const medico = await this.medicoRepository.findById(medicoId);
        const execPromise = promisify(exec);
        if (!medico) {
            throw new Error("Médico não encontrado");
        }

        // Salvar questionário
        const questionario = await this.questionarioRepository.create(
            questionarioData
        );

        try {
            // Extrair os dados relevantes do questionário para o modelo de IA
            const modelInput =
                this.extractModelInputFromQuestionario(questionarioData);

            // Converter os dados para o formato JSON esperado pelo script Python
            const inputJson = JSON.stringify([modelInput]);

            // Caminho para o script Python (ajuste conforme necessário)
            const pythonScriptPath = path.resolve(
                __dirname,
                "../utils/python/class_heart.py"
            );

            // Executar o script Python com os dados do questionário
            const { stdout, stderr } = await execPromise(
                `python "${pythonScriptPath}" --input "${inputJson}"`
            );

            if (stderr) {
                console.error("Erro ao executar o modelo Python:", stderr);
                throw new Error("Falha ao processar o algoritmo de predição");
            }

            // Extrair o resultado da saída do script Python
            // Assumindo que a saída é algo como "Resultado da previsão: [1]"
            const outputLines = stdout.trim().split("\n");
            const resultLine = outputLines.find((line) => line.includes("["));

            if (!resultLine) {
                throw new Error("Formato de saída do modelo inesperado");
            }

            // Extrair o valor numérico do resultado (0 ou 1)
            const resultMatch = resultLine.match(/(\d+)/);
            console.log(resultMatch);
            const resultado = resultMatch ? parseInt(resultMatch[1], 10) : 0;

            // Gerar recomendação baseada no resultado
            const recomendacao = this.generateRecommendation(
                resultado,
                questionarioData
            );

            // Salvar avaliação
            await this.avaliacaoRepository.create({
                resultado,
                recomendacao,
                medicoId,
                questionarioId: questionario.id,
            });

            return { resultado, recomendacao };
        } catch (error: Error | any) {
            console.error("Erro ao processar questionário:", error);
            throw new Error(
                `Falha ao processar o questionário: ${error.message}`
            );
        }
    }

    private extractModelInputFromQuestionario(
        questionario: IQuestionario
    ): number[] {
        // Mapear os campos do questionário para o formato esperado pelo modelo
        // [age, resting bp s, cholesterol, max heart rate, oldpeak, sex, chest pain type,
        // fasting blood sugar, resting ecg, exercise angina, ST slope]

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

    private calculateRiskScore(data: IQuestionario): number {
        let score = 0;

        // Idade: quanto maior, maior o risco
        score += data.age / 10;

        // Sexo: homens têm maior risco (1 = masculino)
        if (data.sex === 1) score += 2;

        // Tipo de dor no peito (4 = mais grave)
        score += data.chestPainType;

        // Pressão arterial: acima de 130 é preocupante
        if (data.restingBloodPressure > 130) score += 3;

        // Colesterol: acima de 200 é preocupante
        if (data.serumCholesterol > 200) score += 3;

        // Açúcar no sangue em jejum (1 = alto)
        if (data.fastingBloodSugar === 1) score += 2;

        // ECG em repouso (2 = mais grave)
        score += data.restingECG;

        // Frequência cardíaca máxima: quanto menor, pior
        if (data.maxHeartRate < 150) score += 2;

        // Angina induzida por exercício (1 = sim)
        if (data.exerciseAngina === 1) score += 3;

        // Depressão ST (oldpeak): quanto maior, pior
        score += data.oldpeak * 2;

        // Inclinação ST (2 = mais grave)
        score += data.stSlope;

        return score;
    }

    private generateRecommendation(
        resultado: number,
        data: IQuestionario
    ): string {
        if (resultado === 1) {
            return "Paciente apresenta alto risco de doença cardíaca. Recomenda-se avaliação cardiológica completa, incluindo exames complementares como ecocardiograma e teste ergométrico. Considerar ajustes no estilo de vida e medicação preventiva.";
        } else {
            let recomendacao =
                "Paciente apresenta baixo risco de doença cardíaca. ";

            // Adicionar recomendações específicas baseadas nos dados
            if (data.restingBloodPressure > 120) {
                recomendacao += "Monitorar pressão arterial regularmente. ";
            }

            if (data.serumCholesterol > 180) {
                recomendacao +=
                    "Considerar ajustes na dieta para controle do colesterol. ";
            }

            if (data.age > 50) {
                recomendacao +=
                    "Realizar check-up cardiológico anual devido à idade. ";
            }

            return (
                recomendacao +
                "Manter hábitos saudáveis e atividade física regular."
            );
        }
    }
}
