import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Medico } from "./Medico";
import { QuestionarioSono } from "./QuestionarioSono";

@Entity("avaliacoes_sono")
export class AvaliacaoSono {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "tinyint" })
	resultado: number;

	@Column({ type: "text" })
	recomendacao: string;

	@CreateDateColumn({ type: "timestamp" })
	data: Date;

	@Column({ name: "medico_id" })
	medicoId: string;

	@ManyToOne(() => Medico, (medico) => medico.avaliacoesSono)
	@JoinColumn({ name: "medico_id" })
	medico: Medico;

	@OneToOne(() => QuestionarioSono, (questionario) => questionario.avaliacao)
	@JoinColumn({ name: "questionario_sono_id" })
	questionario: QuestionarioSono;

	@UpdateDateColumn({ type: "timestamp" })
	updatedAt: Date;
}
