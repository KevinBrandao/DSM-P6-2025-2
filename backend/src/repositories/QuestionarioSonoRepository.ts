import { AppDataSource } from "../config/database";
import { QuestionarioSono } from "../models/entities/QuestionarioSono";
import { IQuestionarioSono } from "../models/interfaces/IQuestionarioSono";

export class QuestionarioSonoRepository {
    private repository = AppDataSource.getRepository(QuestionarioSono);

    async create(questionarioData: IQuestionarioSono): Promise<QuestionarioSono> {
        const questionario = this.repository.create(questionarioData);
        return await this.repository.save(questionario);
    }

    async findById(id: string): Promise<QuestionarioSono | null> {
        return await this.repository.findOne({ where: { id } });
    }
}