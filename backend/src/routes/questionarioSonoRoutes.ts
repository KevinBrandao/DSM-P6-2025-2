import { Router } from "express";
import { QuestionarioSonoController } from "../controllers/QuestionarioSonoController";
import authMiddleware from "../middlewares/authMiddleware";
import { body } from "express-validator";

const questionarioSonoRoutes = Router();
const questionarioSonoController = new QuestionarioSonoController();

questionarioSonoRoutes.post(
    "/",
    authMiddleware,
    [
        body("Gender")
            .isInt({ min: 0, max: 1 })
            .withMessage("Gender deve ser 0 (Feminino) ou 1 (Masculino)"),
        body("Age")
            .isInt({ min: 1, max: 120 })
            .withMessage("Age deve ser um número entre 1 e 120"),
        body("Occupation")
            .notEmpty()
            .withMessage("Occupation é obrigatório"),
        body("Sleep Duration")
            .isFloat({ min: 0, max: 24 })
            .withMessage("Sleep Duration deve ser um número entre 0 e 24 horas"),
        body("Quality of Sleep")
            .isInt({ min: 1, max: 10 })
            .withMessage("Quality of Sleep deve ser entre 1 (muito ruim) e 10 (excelente)"),
        body("Physical Activity Level")
            .isInt({ min: 0, max: 100 })
            .withMessage("Physical Activity Level deve ser entre 0 e 100"),
        body("Stress Level")
            .isInt({ min: 1, max: 10 })
            .withMessage("Stress Level deve ser entre 1 (muito baixo) e 10 (muito alto)"),
        body("BMI Category")
            .isIn(["Normal", "Overweight", "Obese", "Underweight"])
            .withMessage("BMI Category deve ser: Normal, Overweight, Obese ou Underweight"),
        body("Blood Pressure")
            .matches(/^\d{2,3}\/\d{2,3}$/)
            .withMessage("Blood Pressure deve estar no formato 'SYS/DIA' (ex: 120/80)"),
        body("Heart Rate")
            .isInt({ min: 30, max: 200 })
            .withMessage("Heart Rate deve ser entre 30 e 200 bpm"),
        body("Daily Steps")
            .isInt({ min: 0, max: 50000 })
            .withMessage("Daily Steps deve ser entre 0 e 50000"),
    ],
    questionarioSonoController.process.bind(questionarioSonoController)
);

export default questionarioSonoRoutes;