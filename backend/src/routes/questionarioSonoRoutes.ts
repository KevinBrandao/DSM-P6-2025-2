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
		body("nome")
			.notEmpty()
			.withMessage("Nome é obrigatório")
			.isLength({ min: 2, max: 100 })
			.withMessage("Nome deve ter entre 2 e 100 caracteres"),

		body("gender")
			.isInt({ min: 0, max: 1 })
			.withMessage("Gender deve ser 0 (Feminino) ou 1 (Masculino)"),

		body("age")
			.isInt({ min: 1, max: 120 })
			.withMessage("Age deve ser um número entre 1 e 120"),

		body("occupation")
			.isIn([
				"Accountant",
				"Doctor",
				"Engineer",
				"Lawyer",
				"Manager",
				"Nurse",
				"Sales Representative",
				"Salesperson",
				"Scientist",
				"Software Engineer",
				"Teacher",
			])
			.withMessage(
				"Occupation deve ser uma das opções da lista (ex: Software Engineer, Doctor, etc.)"
			),

		body("sleepDuration")
			.isFloat({ min: 0, max: 24 })
			.withMessage(
				"Sleep Duration deve ser um número between 0 e 24 horas"
			),

		body("qualityOfSleep")
			.isInt({ min: 1, max: 10 })
			.withMessage(
				"Quality of Sleep deve ser entre 1 (muito ruim) e 10 (excelente)"
			),

		body("physicalActivityLevel")
			.isInt({ min: 0, max: 100 })
			.withMessage("Physical Activity Level deve ser entre 0 e 100"),

		body("stressLevel")
			.isInt({ min: 1, max: 10 })
			.withMessage(
				"Stress Level deve ser entre 1 (muito baixo) e 10 (muito alto)"
			),

		body("bmiCategory")
			.isIn(["Normal", "Overweight", "Obese"])
			.withMessage(
				"BMI Category deve ser: Normal, Overweight, Obese ou Underweight"
			),

		body("bloodPressure")
			.matches(/^\d{2,3}\/\d{2,3}$/)
			.withMessage(
				"Blood Pressure deve estar no formato 'SYS/DIA' (ex: 120/80)"
			),

		body("heartRate")
			.isInt()
			.withMessage("Heart Rate deve ser um número inteiro"),

		body("dailySteps")
			.isInt({ min: 0, max: 50000 })
			.withMessage("Daily Steps deve ser entre 0 e 50000"),
	],
	questionarioSonoController.process.bind(questionarioSonoController)
);

export default questionarioSonoRoutes;
