import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { AvaliacaoSono } from "./AvaliacaoSono";

@Entity("questionarios_sono")
export class QuestionarioSono {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar" })
    nome: string;

    @Column({ type: "tinyint" })
    gender: number;

    @Column({ type: "int" })
    age: number;

    @Column({ type: "varchar" })
    occupation: string;

    @Column({ type: "float" })
    sleepDuration: number;

    @Column({ type: "int" })
    qualityOfSleep: number;

    @Column({ type: "int" })
    physicalActivityLevel: number;

    @Column({ type: "int" })
    stressLevel: number;

    @Column({ type: "varchar" })
    bmiCategory: string;

    @Column({ type: "varchar" })
    bloodPressure: string;

    @Column({ type: "int" })
    heartRate: number;

    @Column({ type: "int" })
    dailySteps: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @OneToOne(() => AvaliacaoSono, (avaliacao) => avaliacao.questionario)
    avaliacao: AvaliacaoSono;
}