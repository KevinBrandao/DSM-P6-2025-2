import { Router } from "express";
import { QuestionarioController } from "../controllers/QuestionarioController";
import authMiddleware from "../middlewares/authMiddleware";
import { body } from "express-validator";

const questionarioRoutes = Router();
const questionarioController = new QuestionarioController();

questionarioRoutes.post(
    "/",
    authMiddleware,
    [
        body("nome").notEmpty().withMessage("Nome é obrigatório"),
        body("age").isInt().withMessage("Idade deve ser um número inteiro"),
        body("sex")
            .isInt({ min: 0, max: 1 })
            .withMessage("Sexo deve ser 0 ou 1"),
        body("chestPainType")
            .isInt({ min: 1, max: 4 })
            .withMessage("Tipo de dor no peito deve ser entre 1 e 4"),
        body("restingBloodPressure")
            .isFloat()
            .withMessage("Pressão arterial em repouso deve ser um número"),
        body("serumCholesterol")
            .isFloat()
            .withMessage("Colesterol sérico deve ser um número"),
        body("fastingBloodSugar")
            .isInt({ min: 0, max: 1 })
            .withMessage("Açúcar no sangue em jejum deve ser 0 ou 1"),
        body("restingECG")
            .isInt({ min: 0, max: 2 })
            .withMessage("ECG em repouso deve ser entre 0 e 2"),
        body("maxHeartRate")
            .isFloat()
            .withMessage("Frequência cardíaca máxima deve ser um número"),
        body("exerciseAngina")
            .isInt({ min: 0, max: 1 })
            .withMessage("Angina induzida por exercício deve ser 0 ou 1"),
        body("oldpeak").isFloat().withMessage("Oldpeak deve ser um número"),
        body("stSlope")
            .isInt({ min: 1, max: 3 })
            .withMessage("Inclinação ST deve ser entre 1 e 3"),
    ],
    questionarioController.process.bind(questionarioController)
);

export default questionarioRoutes;
