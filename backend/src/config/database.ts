import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql", // Alterado para MySQL
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"), // Porta padrão do MySQL
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || "cardiocheck",
    logging: process.env.NODE_ENV === "development",
    entities: [path.join(__dirname, "..", "models", "entities", "*.{ts,js}")],
    migrations: [path.join(__dirname, "..", "migrations", "*.{ts,js}")],
    subscribers: [path.join(__dirname, "..", "subscribers", "*.{ts,js}")],
    charset: "utf8mb4", // Suporte a caracteres Unicode
});
