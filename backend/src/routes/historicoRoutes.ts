import { Router } from "express";
import { HistoricoController } from "../controllers/HistoricoController";
import authMiddleware from "../middlewares/authMiddleware";

const historicoRoutes = Router();
const historicoController = new HistoricoController();

historicoRoutes.get(
    "/coracao",
    authMiddleware,
    historicoController.getHistorico.bind(historicoController)
);

historicoRoutes.get(
    "/sono",
    authMiddleware,
    historicoController.getHistoricoSono.bind(historicoController)
);

export default historicoRoutes;
