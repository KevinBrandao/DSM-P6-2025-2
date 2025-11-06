import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import errorMiddleware from "./middlewares/errorMiddleware";
import { NatsService, NatsConfig } from "./services/NatsService"; // 1. Importe o serviço
import { ResultConsumerService } from "./services/ResultConsumerService";

// Estender a interface Request para incluir userId
declare global {
	namespace Express {
		interface Request {
			userId: string;
		}
	}
}

const app = express();

async function startServer() {
	// 2. Conecte-se ao NATS antes de iniciar o servidor Express
	try {
		const natsConfig: NatsConfig = {
			servers: process.env.NATS_URL || "nats://localhost:4222",
			connectionName: "api_backend_service",
			maxReconnectAttempts: 10,
			reconnectTimeWait: 5000, // 5 segundos
			timeout: 10000, // 10 segundos
		};
		const natsService = NatsService.getInstance(natsConfig);
		await natsService.connect();

		// Inicia o consumidor de resultados
		const resultConsumer = new ResultConsumerService();
		await resultConsumer.start();

		// Adiciona um hook para fechar a conexão NATS de forma limpa
		const shutdown = async () => {
			console.log("Desligando o servidor...");
			await natsService.close();
			process.exit(0);
			// app.close(() => {
			// 	console.log("Servidor Express fechado.");
			// 	process.exit(0);
			// });
		};

		process.on("SIGINT", shutdown);
		process.on("SIGTERM", shutdown);
	} catch (error) {
		console.error(
			"Falha crítica ao conectar ao NATS. A aplicação não será iniciada.",
			error
		);
		process.exit(1);
	}

	dotenv.config();

	// Inicializar conexão com o banco de dados
	AppDataSource.initialize()
		.then(() => {
			console.log("Conexão com o banco de dados estabelecida");
		})
		.catch((error) =>
			console.log("Erro ao conectar ao banco de dados:", error)
		);

	// Middlewares
	app.use(cors());
	app.use(express.json());

	// Rotas
	app.use("/v1", routes);

	// Middleware de erro
	app.use(errorMiddleware);

	// Rota para verificar se a API está funcionando
	app.get("/", (req, res) => {
		res.json({ message: "CardioCheck API está funcionando!" });
	});

	// Iniciar servidor
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Servidor rodando na porta ${PORT}`);
	});
}

startServer();

// Importar as rotas
import routes from "./routes";

export default app;
