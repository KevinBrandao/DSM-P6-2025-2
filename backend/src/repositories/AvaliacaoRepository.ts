import { AppDataSource } from "../config/database";
import { Avaliacao } from "../models/entities/Avaliacao";
import { IAvaliacao } from "../models/interfaces/IAvaliacao";
import { Medico } from "../models/entities/Medico";
import { Questionario } from "../models/entities/Questionario";

export class AvaliacaoRepository {
    private repository = AppDataSource.getRepository(Avaliacao);

    async create(avaliacaoData: Partial<IAvaliacao>): Promise<Avaliacao> {
        // Criar uma nova avaliação com referências ao médico e questionário
        const avaliacao = new Avaliacao();
        avaliacao.resultado = avaliacaoData.resultado!;
        avaliacao.recomendacao = avaliacaoData.recomendacao!;

        // Configurar relações
        const medico = new Medico();
        medico.id = avaliacaoData.medicoId!;
        avaliacao.medico = medico;
        avaliacao.medicoId = avaliacaoData.medicoId!;

        const questionario = new Questionario();
        questionario.id = avaliacaoData.questionarioId!;
        avaliacao.questionario = questionario;
        avaliacao.questionarioId = avaliacaoData.questionarioId!;

        return await this.repository.save(avaliacao);
    }

    async save(avaliacao: Avaliacao): Promise<Avaliacao> {
        return await this.repository.save(avaliacao);
    }

    async findByMedicoId(medicoId: string): Promise<Avaliacao[]> {
        return await this.repository.find({
            where: { medicoId },
            relations: ["questionario"],
            order: { data: "DESC" },
        });
    }

    async findById(id: string): Promise<Avaliacao | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["medico", "questionario"],
        });
    }
}
