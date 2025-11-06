import { AppDataSource } from "../config/database";
import { QuestionarioSono } from "../models/entities/QuestionarioSono";
import { IQuestionarioSono } from "../models/interfaces/IQuestionarioSono";

export class QuestionarioSonoRepository {
    private repository = AppDataSource.getRepository(QuestionarioSono);

    /**
     * Cria e salva um novo questionário de sono no banco de dados
     * @param questionarioData Dados do questionário de sono
     * @returns O registro criado
     */
    async create(questionarioData: IQuestionarioSono): Promise<QuestionarioSono> {
        const questionarioSono = this.repository.create(questionarioData);
        return await this.repository.save(questionarioSono);
    }

    /**
     * Busca um questionário de sono pelo ID (person_id)
     * @param person_id Identificador do questionário de sono
     * @returns O registro encontrado ou null
     */
    async findById(person_id: number): Promise<QuestionarioSono | null> {
        return await this.repository.findOne({ where: { person_id } });
    }

    /**
     * Retorna todos os questionários de sono cadastrados
     */
    async findAll(): Promise<QuestionarioSono[]> {
        return await this.repository.find();
    }

    /**
     * Atualiza um questionário de sono existente
     */
    async update(person_id: number, data: Partial<IQuestionarioSono>): Promise<QuestionarioSono | null> {
        await this.repository.update({ person_id }, data);
        return this.findById(person_id);
    }

    /**
     * Remove um questionário de sono pelo ID
     */
    async delete(person_id: number): Promise<void> {
        await this.repository.delete({ person_id });
    }
}
