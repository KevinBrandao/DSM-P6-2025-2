import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableQuestionariosSono1748990904206 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de questionários de sono
        await queryRunner.query(`
            CREATE TABLE questionarios_sono (
                id VARCHAR(36) NOT NULL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                gender TINYINT NOT NULL,
                age INT NOT NULL,
                occupation VARCHAR(100) NOT NULL,
                sleep_duration DECIMAL(3,1) NOT NULL,
                quality_of_sleep INT NOT NULL,
                physical_activity_level INT NOT NULL,
                stress_level INT NOT NULL,
                bmi_category VARCHAR(50) NOT NULL,
                blood_pressure VARCHAR(10) NOT NULL,
                heart_rate INT NOT NULL,
                daily_steps INT NOT NULL,
                sleep_disorder VARCHAR(50) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Criar tabela de avaliações de sono
        await queryRunner.query(`
            CREATE TABLE avaliacoes_sono (
                id VARCHAR(36) NOT NULL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                resultado TINYINT NOT NULL,
                recomendacao TEXT NULL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                medico_id VARCHAR(36) NOT NULL,
                questionario_sono_id VARCHAR(36) NOT NULL UNIQUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_avaliacao_sono_medico
                    FOREIGN KEY (medico_id)
                    REFERENCES medicos(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_avaliacao_sono_questionario
                    FOREIGN KEY (questionario_sono_id)
                    REFERENCES questionarios_sono(id)
                    ON DELETE CASCADE,
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover relacionamento da tabela de avaliações existente (se existir)
        await queryRunner.query(`
            ALTER TABLE avaliacoes
            DROP FOREIGN KEY fk_avaliacao_questionario_sono,
            DROP COLUMN questionario_sono_id,
        `);

        // Remover tabela de avaliações de sono
        await queryRunner.query(`DROP TABLE avaliacoes_sono`);

        // Remover tabela de questionários de sono
        await queryRunner.query(`DROP TABLE questionarios_sono`);
    }
}