import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	OneToOne,
} from "typeorm";
import { Avaliacao } from "./Avaliacao";

@Entity("questionarios_sono")
export class QuestionarioSono {
	@PrimaryGeneratedColumn()
	person_id: number;

	@Column({ type: "enum", enum: ["Male", "Female"] })
	gender: "Male" | "Female";

	@Column({ type: "int" })
	age: number;

	@Column({ type: "varchar", length: 100 })
	occupation: string;

	@Column({ type: "decimal", precision: 3, scale: 1 })
	sleep_duration: number;

	@Column({ type: "int" })
	quality_of_sleep: number;

	@Column({ type: "int" })
	physical_activity_level: number;

	@Column({ type: "int" })
	stress_level: number;

	@Column({ type: "varchar", length: 50 })
	bmi_category: string;

	@Column({ type: "varchar", length: 10 })
	blood_pressure: string;

	@Column({ type: "int" })
	heart_rate: number;

	@Column({ type: "int" })
	daily_steps: number;

	@Column({ type: "varchar", length: 50, nullable: true })
	sleep_disorder?: string;

	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;

	@OneToOne(() => Avaliacao, (avaliacao) => avaliacao.questionarioSono)
	avaliacao: Avaliacao;
}
