import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Info, RefreshCw } from "lucide-react";
import api from "../services/api";
import { type IAvaliacao, type IQuestionario, type IResultado } from "../types";
import "./QuestionarioPage.css";

const initialFormState: IQuestionario = {
    nome: "",
    age: 40,
    sex: 1,
    chestPainType: 1,
    restingBloodPressure: 120,
    serumCholesterol: 200,
    fastingBloodSugar: 0,
    restingECG: 0,
    maxHeartRate: 150,
    exerciseAngina: 0,
    oldpeak: 1.0,
    stSlope: 0,
};

interface SliderFieldProps {
    label: React.ReactNode;
    name: keyof IQuestionario;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const SliderField: React.FC<SliderFieldProps> = ({
    label,
    name,
    value,
    min,
    max,
    step = 1,
    unit,
    onChange
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

interface ToggleFieldProps {
    label: string;
    name: keyof IQuestionario;
    value: number;
    onChange: (name: keyof IQuestionario) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({
    label,
    name,
    value,
    onChange
}) => (
    <div className="toggle-group">
        <label className="toggle-label">
            <span>{label}</span>
            <div
                className={`toggle ${value === 1 ? "toggle--active" : ""}`}
                onClick={() => onChange(name)}
            >
                <div className="toggle-thumb"></div>
            </div>
            <span className="toggle-text">
                {value === 1 ? "Sim" : "Não"}
            </span>
        </label>
    </div>
);

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
                    <div className="tooltip-content">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};

const QuestionarioPage: React.FC = () => {
    const [formData, setFormData] = useState<IQuestionario>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, setAvaliacaoId] = useState<string | null>(null);
    const navigate = useNavigate();

    const pollResultado = async (id: string, attempts = 0): Promise<IResultado> => {
        const maxAttempts = 15;

        const getInterval = (attempt: number) => {
            if (attempt < 3) return 3000;
            if (attempt < 6) return 10000;
            return 15000;
        };

        try {
            const response = await api.get<IAvaliacao[]>("/historico/coracao");

            const avaliacao = response.data.find(item => item.id === id);

            if (!avaliacao) {
                if (attempts < maxAttempts) {
                    const interval = getInterval(attempts);
                    await new Promise(resolve => setTimeout(resolve, interval));
                    return pollResultado(id, attempts + 1);
                } else {
                    throw new Error("Tempo limite excedido. A avaliação ainda está sendo processada.");
                }
            }

            if (avaliacao.resultado === -1 && attempts < maxAttempts) {
                const interval = getInterval(attempts);
                await new Promise(resolve => setTimeout(resolve, interval));
                return pollResultado(id, attempts + 1);
            }

            if (attempts >= maxAttempts) {
                throw new Error("Processamento está demorando mais que o normal. Verifique o histórico mais tarde.");
            }

            return {
                predicao: avaliacao.resultado,
                recomendacao: avaliacao.resultado === 1
                    ? "Paciente apresenta alto risco cardiovascular. Recomenda-se acompanhamento médico especializado e exames complementares."
                    : "Paciente apresenta baixo risco cardiovascular. Mantenha hábitos saudáveis e acompanhamento regular."
            };

        } catch (error: any) {
            console.error("❌ Erro no polling:", error);

            if (attempts < maxAttempts && (error.message?.includes('Network') || error.message?.includes('timeout'))) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                return pollResultado(id, attempts + 1);
            }

            throw error;
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        const processedValue =
            type === "number" || name === "maxHeartRate" || name === "oldpeak"
                ? parseFloat(value)
                : value;

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleToggleChange = (name: keyof IQuestionario) => {
        setFormData((prev) => ({
            ...prev,
            [name]: prev[name] === 1 ? 0 : 1,
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

            const response = await api.post<{
                message: string;
                avaliacao: {
                    id: string;
                    resultado: number;
                    recomendacao: string;
                    data: string;
                    questionarioId: string;
                };
            }>("/questionarios/coracao", dataToSend);

            const { avaliacao } = response.data;

            if (!avaliacao || typeof avaliacao.resultado === 'undefined') {
                throw new Error("Resposta da API em formato inválido");
            }

            if (avaliacao.resultado !== -1) {
                navigate("/resultado", {
                    state: {
                        questionario: dataToSend,
                        resultado: {
                            predicao: avaliacao.resultado,
                            recomendacao: avaliacao.resultado === 1
                                ? "Paciente apresenta alto risco cardiovascular. Recomenda-se acompanhamento médico especializado e exames complementares."
                                : "Paciente apresenta baixo risco cardiovascular. Mantenha hábitos saudáveis e acompanhamento regular."
                        },
                    },
                });
                return;
            }

            setIsLoading(false);
            setIsPolling(true);
            setAvaliacaoId(avaliacao.id);

            const resultadoFinal = await pollResultado(avaliacao.id);

            navigate("/resultado", {
                state: {
                    questionario: dataToSend,
                    resultado: resultadoFinal,
                },
            });

        } catch (error: any) {
            console.error("💥 Erro detalhado:", error);
            setError(
                error.message || "Houve um erro ao enviar o questionário. Tente novamente."
            );
            setIsPolling(false);
        } finally {
            setIsLoading(false);
        }
    };

    const tooltipContent = {
        inclinacaoST: "Inclinação do Pico do Segmento ST\n\nEste campo descreve a inclinação do segmento ST no eletrocardiograma durante o pico do exercício.\n\n• Normal (Flat): Risco intermediário.\n\n• Ascendente (Upsloping): Geralmente considerado de baixo risco.\n\n• Descendente (Downsloping): Geralmente indica um maior risco de isquemia miocárdica (fluxo sanguíneo inadequado para o coração).",

        oldpeak: "Oldpeak\n\nRefere-se à depressão do segmento ST induzida pelo exercício em relação ao estado de repouso.\n\nÉ um importante indicador eletrocardiográfico de isquemia miocárdica.",

        dorPeito: "Tipos de Dor no Peito\n\n• Angina Típica: Dor torácica clássica relacionada ao esforço ou estresse, aliviada com repouso.\n\n• Angina Atípica: Dor que não preenche todos os critérios da angina típica.\n\n• Dor Não-anginosa: Dor no peito que provavelmente não é de origem cardíaca.\n\n• Assintomático: Ausência de dor no peito.",

        ecg: "Eletrocardiograma em Repouso\n\nResultados:\n\n• Normal: Sem anormalidades significativas.\n\n• Anormalidade da onda ST-T: Pode indicar problemas de repolarização ventricular, isquemia, entre outros.\n\n• Hipertrofia ventricular esquerda: Sugere um aumento da massa muscular do ventrículo esquerdo, frequentemente associado à hipertensão."
    };

    return (
        <div className="questionario-container">

            {isPolling && (
                <div className="polling-overlay">
                    <div className="polling-content">
                        <RefreshCw size={32} className="polling-spinner" />
                        <h3>Processando Avaliação Cardíaca</h3>
                        <p className="polling-message">
                            Sua avaliação está sendo processada e o resultado será retornado automaticamente.
                        </p>
                    </div>
                </div>
            )}

            <div className="questionario-header">
                <h2>Avaliação de Risco Cardíaco</h2>
                <p>
                    Preencha os dados do paciente para análise completa do risco cardiovascular
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
                            <label htmlFor="age">Idade</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                min="1"
                                max="110"
                                className="input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sex">Sexo</label>
                            <select
                                id="sex"
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="1">Masculino</option>
                                <option value="0">Feminino</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h3>Dados de Exames e Sintomas</h3>
                    </div>
                    <div className="exams-symptoms-grid">
                        <div className="grid-column">
                            <div className="column-header">
                                <h4>Sinais Vitais</h4>
                            </div>
                            <div className="column-content">
                                <SliderField
                                    label="Pressão Arterial em Repouso"
                                    name="restingBloodPressure"
                                    value={formData.restingBloodPressure}
                                    min={70}
                                    max={220}
                                    unit="mm Hg"
                                    onChange={handleChange}
                                />

                                <SliderField
                                    label="Colesterol Sérico"
                                    name="serumCholesterol"
                                    value={formData.serumCholesterol}
                                    min={100}
                                    max={500}
                                    unit="mg/dl"
                                    onChange={handleChange}
                                />

                                <SliderField
                                    label="Frequência Cardíaca Máxima Atingida"
                                    name="maxHeartRate"
                                    value={formData.maxHeartRate}
                                    min={60}
                                    max={220}
                                    unit="bpm"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-column">
                            <div className="column-header">
                                <h4>Exames e Diagnósticos</h4>
                            </div>
                            <div className="column-content">
                                <div className="form-group">
                                    <label htmlFor="restingECG" className="label-with-tooltip">
                                        Eletrocardiograma em Repouso
                                        <TooltipIcon content={tooltipContent.ecg} />
                                    </label>
                                    <select
                                        id="restingECG"
                                        name="restingECG"
                                        value={formData.restingECG}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="0">Normal</option>
                                        <option value="1">Anormalidade ST-T</option>
                                        <option value="2">Hipertrofia VE</option>
                                    </select>
                                </div>

                                <div></div>

                                <div className="form-group">
                                    <label htmlFor="chestPainType" className="label-with-tooltip">
                                        Tipo de Dor no Peito
                                        <TooltipIcon content={tooltipContent.dorPeito} />
                                    </label>
                                    <select
                                        id="chestPainType"
                                        name="chestPainType"
                                        value={formData.chestPainType}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="1">Angina Típica</option>
                                        <option value="2">Angina Atípica</option>
                                        <option value="3">Dor Não-anginosa</option>
                                        <option value="4">Assintomático</option>
                                    </select>
                                </div>

                                <div></div>

                                <div className="form-group">
                                    <label htmlFor="stSlope" className="label-with-tooltip">
                                        Inclinação do Pico do Segmento ST
                                        <TooltipIcon content={tooltipContent.inclinacaoST} />
                                    </label>
                                    <select
                                        id="stSlope"
                                        name="stSlope"
                                        value={formData.stSlope}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="0">Normal</option>
                                        <option value="1">Ascendente</option>
                                        <option value="2">Descendente</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid-column">
                            <div className="column-header">
                                <h4>Testes e Indicadores</h4>
                            </div>
                            <div className="column-content">
                                <SliderField
                                    label={
                                        <span className="label-with-tooltip">
                                            Oldpeak (Depressão de ST por exercício)
                                            <TooltipIcon content={tooltipContent.oldpeak} />
                                        </span>
                                    }
                                    name="oldpeak"
                                    value={formData.oldpeak}
                                    min={0.0}
                                    max={6.2}
                                    step={0.1}
                                    unit=""
                                    onChange={handleChange}
                                />

                                <div></div>

                                <ToggleField
                                    label="Glicemia em Jejum > 120 mg/dl"
                                    name="fastingBloodSugar"
                                    value={formData.fastingBloodSugar}
                                    onChange={handleToggleChange}
                                />

                                <div></div>

                                <ToggleField
                                    label="Angina Induzida por Exercício"
                                    name="exerciseAngina"
                                    value={formData.exerciseAngina}
                                    onChange={handleToggleChange}
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
                        <Heart size={18} />
                        {isLoading ? "Analisando..." : "Analisar Risco Cardíaco"}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
};

export default QuestionarioPage;