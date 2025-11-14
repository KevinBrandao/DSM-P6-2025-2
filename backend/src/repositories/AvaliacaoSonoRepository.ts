import { AppDataSource } from "../config/database";
import { Avaliacao } from "../models/entities/Avaliacao";
import { IAvaliacao } from "../models/interfaces/IAvaliacao";
import { Medico } from "../models/entities/Medico";
import { Questionario } from "../models/entities/Questionario";


export class AvaliacaoSonoRepository {
    private repository = AppDataSource.getRepository(AvaliacaoSono);

    async create(avaliacaoData: Partial<IAvaliacaoSono>): Promise<AvaliacaoSono> {
        // Criar uma nova avaliação com referências ao médico e questionário
        const avaliacao = new AvaliacaoSono();
        avaliacao.resultado = avaliacaoData.resultado!;
        avaliacao.recomendacao = avaliacaoData.recomendacao!;

        // Configurar relações
        const medico = new Medico();
        medico.id = avaliacaoData.medicoId!;
        avaliacao.medico = medico;
        avaliacao.medicoId = avaliacaoData.medicoId!;

        const questionarioSono = new QuestionarioSono();
        questionarioSono.id = avaliacaoData.questionarioSonoId!;
        avaliacao.questionarioSono = questionarioSono;
        avaliacao.questionarioSonoId = avaliacaoData.questionarioSonoId!;

        return await this.repository.save(avaliacao);
    }

    async save(avaliacao: AvaliacaoSono): Promise<AvaliacaoSono> {
        return await this.repository.save(avaliacao);
    }

    async findByMedicoId(medicoId: string): Promise<AvaliacaoSono[]> {
        return await this.repository.find({
            where: { medicoId },
            relations: ["questionarioSono"],
            order: { data: "DESC" },
        });
    }

    async findById(id: string): Promise<AvaliacaoSono | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["medico", "questionarioSono"],
        });
    }
}