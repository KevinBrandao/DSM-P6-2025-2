import React, { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Info } from "lucide-react";
import api from "../services/api";
import { type IQuestionarioSono, type IResultadoSono } from "../types";
import "./QuestionarioSonoPage.css";

const initialFormState: IQuestionarioSono = {
	nome: "",
	gender: 1,
	age: 35,
	occupation: "Engeneer",
	sleepDuration: 7.0,
	qualityOfSleep: 7,
	physicalActivityLevel: 60,
	stressLevel: 5,
	bmiCategory: "Normal",
	bloodPressure: "120/80",
	heartRate: 72,
	dailySteps: 6000,
	// sleepDisorder: "None",
};

interface SliderFieldProps {
	label: React.ReactNode;
	name: keyof IQuestionarioSono;
	value: number;
	min: number;
	max: number;
	step?: number;
	unit: string;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
}

const SliderField: React.FC<SliderFieldProps> = ({
	label,
	name,
	value,
	min,
	max,
	step = 1,
	unit,
	onChange,
}) => (
	<div className="slider-field-wrapper">
		<div className="form-group">
			<label htmlFor={name.toString()}>{label}</label>
			<div className="slider-container">
				<div className="slider-header">
					<span className="slider-value">
						{value} {unit}
					</span>
				</div>
				<input
					type="range"
					id={name.toString()}
					name={name.toString()}
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={onChange}
					className="slider"
				/>
			</div>
		</div>
	</div>
);

const QuestionarioSonoPage: React.FC = () => {
	const [formData, setFormData] =
		useState<IQuestionarioSono>(initialFormState);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const ocupacoes = [
		{
			"Nome": "Engenheiro",
			"Value": "Engineer"
		},
		{
			"Nome": "Médico",
			"Value": "Doctor"
		},
		{
			"Nome": "Professor",
			"Value": "Teacher"
		},
		{
			"Nome": "Enfermeiro",
			"Value": "Nurse"
		},
		{
			"Nome": "Contador",
			"Value": "Accountant"
		},
		{
			"Nome": "Engenheiro de Software",
			"Value": "Software Engineer"
		},
		{
			"Nome": "Representante de Vendas",
			"Value": "Sales Representative"
		},
		{
			"Nome": "Gerente",
			"Value": "Manager"
		},
		{
			"Nome": "Estudante",
			"Value": "Student"
		},
		{
			"Nome": "Outro",
			"Value": "Other"
		}
	];

	const categoriasIMC = ["Normal", "Overweight", "Obese"];
	// const disturbiosSono = ["None", "Sleep Apnea", "Insomnia"];

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const processedValue = type === "number" ? parseFloat(value) : value;

		setFormData((prev) => ({
			...prev,
			[name]: processedValue,
		}));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const dataToSend = { ...formData };
			if (!dataToSend.nome) {
				dataToSend.nome = `Paciente ${new Date().toLocaleTimeString()}`;
			}

			const response = await api.post<IResultadoSono>(
				"/questionarios/sono",
				dataToSend
			);

			navigate("/resultado-sono", {
				state: {
					questionario: dataToSend,
					resultado: response.data,
				},
			});
		} catch (error: any) {
			setError(
				"Houve um erro ao enviar o questionário. Tente novamente."
			);
			console.error("Erro ao enviar questionário de sono:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="questionario-container">
			<div className="questionario-header">
				<h2>Avaliação da Qualidade do Sono</h2>
				<p>
					Analise padrões de sono e identifique possíveis distúrbios
					do sono
				</p>
			</div>

			<form onSubmit={handleSubmit} className="questionario-form">
				<div className="form-section">
					<div className="section-header">
						<h3>Dados Pessoais</h3>
					</div>
					<div className="section-grid personal-data-grid">
						<div className="form-group">
							<label htmlFor="nome">Nome do Paciente</label>
							<input
								type="text"
								id="nome"
								name="nome"
								value={formData.nome}
								onChange={handleChange}
								placeholder="Nome completo"
								className="input"
							/>
						</div>

						<div className="form-group">
							<label htmlFor="gender">Gênero</label>
							<select
								id="gender"
								name="gender"
								value={formData.gender}
								onChange={handleChange}
								className="form-select"
							>
								<option value="0">Feminino</option>
								<option value="1">Masculino</option>
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="age">Idade</label>
							<input
								type="number"
								id="age"
								name="age"
								value={formData.age}
								onChange={handleChange}
								min="27"
								max="59"
								className="input"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="occupation">Ocupação</label>
							<select
								id="occupation"
								name="occupation"
								value={formData.occupation}
								onChange={handleChange}
								className="form-select"
							>
								{ocupacoes.map((occupation) => (
									<option key={occupation.Nome} value={occupation.Value}>
										{occupation.Nome}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="form-section">
					<div className="section-header">
						<h3>Dados de Sono e Saúde</h3>
					</div>
					<div className="exams-symptoms-grid">
						<div className="grid-column">
							<div className="column-header">
								<h4>Padrões de Sono</h4>
							</div>
							<div className="column-content" style={{ gap: '3rem' }}>
								<SliderField
									label="Duração do Sono"
									name="sleepDuration"
									value={formData.sleepDuration}
									min={5.8}
									max={8.5}
									step={0.1}
									unit="horas"
									onChange={handleChange}
								/>

								<SliderField
									label="Qualidade do Sono"															
									name="qualityOfSleep"
									value={formData.qualityOfSleep}
									min={1}
									max={10}
									unit="/10"
									onChange={handleChange}
								/>								
							</div>
						</div>

						<div className="grid-column">
							<div className="column-header">
								<h4>Indicadores de Saúde</h4>
							</div>
							<div className="column-content">
								<div className="form-group">
									<label htmlFor="bmiCategory">
										Categoria de IMC
									</label>
									<select
										id="bmiCategory"
										name="bmiCategory"
										value={formData.bmiCategory}
										onChange={handleChange}
										className="form-select"
									>
										{categoriasIMC.map((bmiCategory) => (
											<option
												key={bmiCategory}
												value={bmiCategory}
											>
												{bmiCategory === "Normal"
													? "Normal"
													: bmiCategory ===
														"Overweight"
														? "Sobrepeso"
														: "Obeso"}
											</option>
										))}
									</select>
								</div>

								<div className="form-group">
									<label htmlFor="bloodPressure">
										Pressão Arterial
									</label>
									<input
										type="text"
										id="bloodPressure"
										name="bloodPressure"
										placeholder="Ex: 120/80"
										value={formData.bloodPressure}
										onChange={handleChange}
										className="input"
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="heartRate">
										Frequência Cardíaca
									</label>
									<input
										type="number"
										id="heartRate"
										name="heartRate"
										min="65"
										max="86"
										value={formData.heartRate}
										onChange={handleChange}
										className="input"
										required
									/>
								</div>
							</div>
						</div>

						<div className="grid-column">
							<div className="column-header">
								<h4>Atividade e Estilo de Vida</h4>
							</div>
							<div className="column-content">
								<SliderField
									label="Nível de Atividade Física"
									name="physicalActivityLevel"
									value={formData.physicalActivityLevel}
									min={30}
									max={90}
									unit=""
									onChange={handleChange}
								/>

								<SliderField
									label="Nível de Estresse"
									name="stressLevel"
									value={formData.stressLevel}
									min={3}
									max={8}
									unit="/8"
									onChange={handleChange}
								/>

								<SliderField
									label="Passos Diários"
									name="dailySteps"
									value={formData.dailySteps}
									min={3000}
									max={10000}
									step={100}
									unit="passos"
									onChange={handleChange}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="submit-section">
					<button
						type="submit"
						disabled={isLoading}
						className="btn btn-primary submit-btn"
					>
						<Moon size={18} />
						{isLoading
							? "Analisando..."
							: "Analisar Qualidade do Sono"}
					</button>
				</div>

				{error && <div className="error-message">{error}</div>}
			</form>
		</div>
	);
};

export default QuestionarioSonoPage;
