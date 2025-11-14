import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    CreateDateColumn,
} from "typeorm";
import { AvaliacaoSono } from "./AvaliacaoSono";

@Entity("questionarios_sono")
export class QuestionarioSono {
    @PrimaryGeneratedColumn("uuid")
    id: string;

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

    @Column({ type: "varchar", nullable: true })
    sleepDisorder: string;

    @Column({ type: "varchar" })
    pacienteId: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @OneToOne(() => AvaliacaoSono, (avaliacao) => avaliacao.questionarioSono)
    avaliacao: AvaliacaoSono;
}