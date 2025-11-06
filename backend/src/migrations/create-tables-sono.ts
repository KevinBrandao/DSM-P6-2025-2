import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableQuestionariosSono1748990904206 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE questionarios_sono (
        person_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        gender ENUM('Male', 'Female') NOT NULL,
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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // Opcional: se quiser vincular com a tabela de avaliações
        await queryRunner.query(`
      ALTER TABLE avaliacoes
      ADD COLUMN questionario_sono_id INT NULL,
      ADD CONSTRAINT fk_avaliacao_questionario_sono
        FOREIGN KEY (questionario_sono_id)
        REFERENCES questionarios_sono(person_id)
        ON DELETE CASCADE,
      ADD UNIQUE KEY (questionario_sono_id);
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover relacionamento primeiro (se existir)
        await queryRunner.query(`
      ALTER TABLE avaliacoes
      DROP FOREIGN KEY fk_avaliacao_questionario_sono,
      DROP COLUMN questionario_sono_id,
      DROP INDEX questionario_sono_id;
    `);

        // Remover tabela principal
        await queryRunner.query(`DROP TABLE questionarios_sono`);
    }
}


git config --global user.name "KevinBrandao"
git config --global user.email "kevenbrandaoms@outlook.com"