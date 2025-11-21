import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, RefreshCw, Info } from "lucide-react";
import api from "../services/api";
import {
	type IQuestionarioSono,
	type IAvaliacaoSono,
	type IResultadoSono,
} from "../types";
import "./QuestionarioSonoPage.css";

const initialFormState: IQuestionarioSono = {
	nome: "",
	gender: 1,
	age: 35,
	occupation: "Engineer",
	sleepDuration: 7.0,
	qualityOfSleep: 7,
	physicalActivityLevel: 60,
	stressLevel: 5,
	bmiCategory: "Normal",
	bloodPressure: "120/80",
	heartRate: 72,
	dailySteps: 6000,
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

// --- Componente Tooltip ---
interface TooltipIconProps {
	content: string;
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ content }) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="tooltip-container">
			<Info
				size={14}
				className="info-icon"
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
			/>
			{isVisible && (
				<div className="tooltip">
					<div className="tooltip-content">{content}</div>
				</div>
			)}
		</div>
	);
};

const QuestionarioSonoPage: React.FC = () => {
	const [formData, setFormData] =
		useState<IQuestionarioSono>(initialFormState);
	const [isLoading, setIsLoading] = useState(false);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// Novo estado para erro de validação da pressão arterial
	const [bpError, setBpError] = useState<string | null>(null);
	const [, setAvaliacaoId] = useState<string | null>(null);
	const navigate = useNavigate();

	const ocupacoes = [
		{ Nome: "Engenheiro(a)", Value: "Engineer" },
		{ Nome: "Médico(a)", Value: "Doctor" },
		{ Nome: "Professor(a)", Value: "Teacher" },
		{ Nome: "Enfermeiro(a)", Value: "Nurse" },
		{ Nome: "Contador(a)", Value: "Accountant" },
		{ Nome: "Engenheiro(a) de Software", Value: "Software Engineer" },
		{ Nome: "Representante de Vendas", Value: "Sales Representative" },
		{ Nome: "Gerente", Value: "Manager" },
		{ Nome: "Advogado(a)", Value: "Lawyer" },
		{ Nome: "Vendedor(a)", Value: "Salesperson" },
		{ Nome: "Cientista", Value: "Scientist" },
	];

	const categoriasIMC = ["Normal", "Overweight", "Obese"];

	const tooltipContent = {
		gender: "O gênero do paciente (Masculino/Feminino).",
		age: "A idade do paciente em anos.",
		occupation: "A ocupação ou profissão atual do paciente.",
		sleepDuration: "O número médio de horas que o paciente dorme por dia.",
		qualityOfSleep:
			"Uma avaliação subjetiva da qualidade do sono, variando de 1 a 10.",
		physicalActivityLevel:
			"O número de minutos que o paciente dedica a atividades físicas diariamente.",
		stressLevel:
			"Uma avaliação subjetiva do nível de estresse vivenciado pelo paciente, variando de 1 a 10.",
		bmiCategory:
			"A categoria de IMC do paciente (ex: Peso Normal, Sobrepeso, Obesidade).",
		bloodPressure:
			"A medida da pressão arterial do paciente (sistólica/diastólica). Formato obrigatório: 120/80.",
		heartRate:
			"A frequência cardíaca de repouso do paciente em batimentos por minuto (bpm).",
		dailySteps: "O número médio de passos que o paciente dá por dia.",
	};

	const pollResultado = async (
		id: string,
		attempts = 0
	): Promise<IResultadoSono> => {
		const maxAttempts = 15;

		const getInterval = (attempt: number) => {
			if (attempt < 3) return 3000;
			if (attempt < 6) return 10000;
			return 15000;
		};

		try {
			const response = await api.get<IAvaliacaoSono[]>("/historico/sono");
			const avaliacao = response.data.find((item) => item.id === id);

			if (!avaliacao) {
				if (attempts < maxAttempts) {
					const interval = getInterval(attempts);
					await new Promise((resolve) =>
						setTimeout(resolve, interval)
					);
					return pollResultado(id, attempts + 1);
				} else {
					throw new Error(
						"Tempo limite excedido. A avaliação ainda está sendo processada."
					);
				}
			}

			if (avaliacao.resultado === -1 && attempts < maxAttempts) {
				const interval = getInterval(attempts);
				await new Promise((resolve) => setTimeout(resolve, interval));
				return pollResultado(id, attempts + 1);
			}

			if (attempts >= maxAttempts) {
				throw new Error(
					"Processamento está demorando mais que o normal. Verifique o histórico mais tarde."
				);
			}

			return {
				predicao: avaliacao.resultado,
				recomendacao:
					avaliacao.resultado === 1
						? "Indícios de distúrbio do sono identificados. Recomenda-se consultar um especialista."
						: "Padrões de sono dentro da normalidade. Continue mantendo bons hábitos.",
			};
		} catch (error: any) {
			console.error("❌ Erro no polling:", error);

			if (
				attempts < maxAttempts &&
				(error.message?.includes("Network") ||
					error.message?.includes("timeout"))
			) {
				await new Promise((resolve) => setTimeout(resolve, 10000));
				return pollResultado(id, attempts + 1);
			}

			throw error;
		}
	};

	// --- Lógica de Validação ---
	const validateBloodPressure = (value: string): boolean => {
		// Regex aceita formatos como 120/80, 90/60, 140/100
		const regex = /^\d{2,3}\/\d{2,3}$/;

		if (!value || !regex.test(value)) {
			setBpError(
				"Formato inválido. Use 'sistólica/diastólica' (ex: 120/80)."
			);
			return false;
		}

		setBpError(null);
		return true;
	};

	const handleBpBlur = () => {
		validateBloodPressure(formData.bloodPressure);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const processedValue = type === "number" ? parseFloat(value) : value;

		setFormData((prev) => ({
			...prev,
			[name]: processedValue,
		}));

		// Limpa o erro enquanto o usuário digita, se desejar
		if (name === "bloodPressure" && bpError) {
			setBpError(null);
		}
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Validação antes do envio
		if (!validateBloodPressure(formData.bloodPressure)) {
			setIsLoading(false);
			// Foca no campo de erro se possível, ou apenas interrompe
			const bpInput = document.getElementById("bloodPressure");
			bpInput?.focus();
			return;
		}

		try {
			const dataToSend = { ...formData };
			if (!dataToSend.nome) {
				dataToSend.nome = `Paciente ${new Date().toLocaleTimeString()}`;
			}

			const response = await api.post<{
				message: string;
				avaliacao: {
					id: string;
					resultado: number;
					recomendacao: string;
					data: string;
					questionarioId: string;
				};
			}>("/questionarios/sono", dataToSend);

			const { avaliacao } = response.data;

			if (!avaliacao || typeof avaliacao.resultado === "undefined") {
				throw new Error("Resposta da API em formato inválido");
			}

			if (avaliacao.resultado !== -1) {
				navigate("/resultado-sono", {
					state: {
						questionario: dataToSend,
						resultado: {
							predicao: avaliacao.resultado,
							recomendacao:
								avaliacao.resultado === 1
									? "Indícios de distúrbio do sono identificados."
									: "Padrões de sono normais.",
						},
					},
				});
				return;
			}

			setIsLoading(false);
			setIsPolling(true);
			setAvaliacaoId(avaliacao.id);

			const resultadoFinal = await pollResultado(avaliacao.id);

			navigate("/resultado-sono", {
				state: {
					questionario: dataToSend,
					resultado: resultadoFinal,
				},
			});
		} catch (error: any) {
			console.error("💥 Erro detalhado:", error);
			setError(
				error.message ||
					"Houve um erro ao enviar o questionário. Tente novamente."
			);
			setIsPolling(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="questionario-container">
			{isPolling && (
				<div className="polling-overlay">
					<div className="polling-content">
						<RefreshCw size={32} className="polling-spinner" />
						<h3>Processando Avaliação de Sono</h3>
						<p className="polling-message">
							Sua avaliação está sendo processada e o resultado
							será retornado automaticamente.
						</p>
					</div>
				</div>
			)}

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
							<label
								htmlFor="gender"
								className="label-with-tooltip"
							>
								Gênero
								<TooltipIcon content={tooltipContent.gender} />
							</label>
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
							<label htmlFor="age" className="label-with-tooltip">
								Idade
								<TooltipIcon content={tooltipContent.age} />
							</label>
							<input
								type="number"
								id="age"
								name="age"
								value={formData.age}
								onChange={handleChange}
								min="1"
								max="120"
								className="input"
								required
							/>
						</div>

						<div className="form-group">
							<label
								htmlFor="occupation"
								className="label-with-tooltip"
							>
								Ocupação
								<TooltipIcon
									content={tooltipContent.occupation}
								/>
							</label>
							<select
								id="occupation"
								name="occupation"
								value={formData.occupation}
								onChange={handleChange}
								className="form-select"
							>
								{ocupacoes.map((occupation) => (
									<option
										key={occupation.Nome}
										value={occupation.Value}
									>
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
							<div
								className="column-content"
								style={{ gap: "3rem" }}
							>
								<SliderField
									label={
										<span className="label-with-tooltip">
											Duração do Sono
											<TooltipIcon
												content={
													tooltipContent.sleepDuration
												}
											/>
										</span>
									}
									name="sleepDuration"
									value={formData.sleepDuration}
									min={1}
									max={16}
									step={0.1}
									unit="horas"
									onChange={handleChange}
								/>

								<SliderField
									label={
										<span className="label-with-tooltip">
											Qualidade do Sono
											<TooltipIcon
												content={
													tooltipContent.qualityOfSleep
												}
											/>
										</span>
									}
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
									<label
										htmlFor="bmiCategory"
										className="label-with-tooltip"
									>
										Categoria de IMC
										<TooltipIcon
											content={tooltipContent.bmiCategory}
										/>
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
									<label
										htmlFor="bloodPressure"
										className="label-with-tooltip"
									>
										Pressão Arterial
										<TooltipIcon
											content={
												tooltipContent.bloodPressure
											}
										/>
									</label>
									<input
										type="text"
										id="bloodPressure"
										name="bloodPressure"
										placeholder="Ex: 120/80"
										value={formData.bloodPressure}
										onChange={handleChange}
										onBlur={handleBpBlur}
										className={`input ${
											bpError ? "input-error" : ""
										}`}
										style={
											bpError
												? { borderColor: "#dc3545" }
												: {}
										}
										required
									/>
									{bpError && (
										<span
											style={{
												color: "#dc3545",
												fontSize: "0.85rem",
												marginTop: "0.25rem",
												display: "block",
											}}
										>
											{bpError}
										</span>
									)}
								</div>

								<div className="form-group">
									<label
										htmlFor="heartRate"
										className="label-with-tooltip"
									>
										Frequência Cardíaca
										<TooltipIcon
											content={tooltipContent.heartRate}
										/>
									</label>
									<input
										type="number"
										id="heartRate"
										name="heartRate"
										min="0"
										max="300"
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
									label={
										<span className="label-with-tooltip">
											Nível de Atividade Física
											<TooltipIcon
												content={
													tooltipContent.physicalActivityLevel
												}
											/>
										</span>
									}
									name="physicalActivityLevel"
									value={formData.physicalActivityLevel}
									min={0}
									max={100}
									unit="min"
									onChange={handleChange}
								/>

								<SliderField
									label={
										<span className="label-with-tooltip">
											Nível de Estresse
											<TooltipIcon
												content={
													tooltipContent.stressLevel
												}
											/>
										</span>
									}
									name="stressLevel"
									value={formData.stressLevel}
									min={1}
									max={10}
									unit="/10"
									onChange={handleChange}
								/>

								<SliderField
									label={
										<span className="label-with-tooltip">
											Passos Diários
											<TooltipIcon
												content={
													tooltipContent.dailySteps
												}
											/>
										</span>
									}
									name="dailySteps"
									value={formData.dailySteps}
									min={0}
									max={20000}
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
