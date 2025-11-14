import { Router } from "express";
import medicoRoutes from "./medicoRoutes";
import authRoutes from "./authRoutes";
import questionarioRoutes from "./questionarioRoutes";
import historicoRoutes from "./historicoRoutes";
import questionarioSonoRoutes from "./questionarioSonoRoutes";

const routes = Router();

routes.use("/medicos", medicoRoutes);
routes.use("/auth", authRoutes);
routes.use("/questionarios", questionarioRoutes);
routes.use("/historico", historicoRoutes);
routes.use("/questionarioSono", questionarioSonoRoutes);

export default routes;
