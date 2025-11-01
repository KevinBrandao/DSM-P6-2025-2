import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import routes from "./routes";
import errorMiddleware from "./middlewares/errorMiddleware";

// Estender a interface Request para incluir userId
declare global {
    namespace Express {
        interface Request {
            userId: string;
        }
    }
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

const app = express();

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

export default app;
