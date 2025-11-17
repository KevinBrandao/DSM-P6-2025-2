import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Avaliacao } from "./Avaliacao";
import { AvaliacaoSono } from "./AvaliacaoSono";

@Entity("medicos")
export class Medico {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 100 })
    nome: string;

    @Column({ type: "varchar", length: 20, unique: true })
    crm: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255 })
    senha: string;

    @Column({ type: "varchar", length: 100 })
    especialidade: string;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @OneToMany(() => Avaliacao, (avaliacao) => avaliacao.medico)
    avaliacoes: Avaliacao[];

    @OneToMany(() => AvaliacaoSono, (avaliacao) => avaliacao.medico)
    avaliacoesSono: AvaliacaoSono[];
}
