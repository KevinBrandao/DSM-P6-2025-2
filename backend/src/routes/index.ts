import { Router } from "express";
import medicoRoutes from "./medicoRoutes";
import authRoutes from "./authRoutes";
import questionarioRoutes from "./questionarioRoutes";
import historicoRoutes from "./historicoRoutes";
import questionarioSonoRoutes from "./questionarioSonoRoutes";

const routes = Router();

routes.use("/medicos", medicoRoutes);
routes.use("/auth", authRoutes);
routes.use("/questionarios/coracao", questionarioRoutes);
routes.use("/historico", historicoRoutes);
routes.use("/questionarios/sono", questionarioSonoRoutes);

export default routes;
