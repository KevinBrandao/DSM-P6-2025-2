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
                sleepDuration DECIMAL(3,1) NOT NULL,
                qualityOfSleep INT NOT NULL,
                physicalActivityLevel INT NOT NULL,
                stressLevel INT NOT NULL,
                bmiCategory VARCHAR(50) NOT NULL,
                bloodPressure VARCHAR(10) NOT NULL,
                heartRate INT NOT NULL,
                dailySteps INT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Criar tabela de avaliações de sono
        await queryRunner.query(`
            CREATE TABLE avaliacoes_sono (
                id VARCHAR(36) NOT NULL PRIMARY KEY,
                resultado TINYINT NOT NULL,
                recomendacao TEXT NULL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                medico_id VARCHAR(36) NOT NULL,
                questionario_sono_id VARCHAR(36) NOT NULL UNIQUE,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_avaliacao_sono_medico
                    FOREIGN KEY (medico_id)
                    REFERENCES medicos(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_avaliacao_sono_questionario
                    FOREIGN KEY (questionario_sono_id)
                    REFERENCES questionarios_sono(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover tabela de avaliações de sono
        await queryRunner.query(`DROP TABLE avaliacoes_sono`);

        // Remover tabela de questionários de sono
        await queryRunner.query(`DROP TABLE questionarios_sono`);
    }
}