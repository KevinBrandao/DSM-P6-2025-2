import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Info } from "lucide-react";
import api from "../services/api";
import { type IQuestionario, type IResultado } from "../types";
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

const QuestionarioPage: React.FC = () => {
    const [formData, setFormData] = useState<IQuestionario>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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

            const response = await api.post<IResultado>(
                "/questionarios",
                dataToSend
            );

            navigate("/resultado", {
                state: {
                    questionario: dataToSend,
                    resultado: response.data,
                },
            });
        } catch {
            setError(
                "Houve um erro ao enviar o questionário. Tente novamente."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="questionario-container">
            <div className="questionario-header">
                <h2>Avaliação de Risco Cardíaco</h2>
                <p>
                    Preencha os dados do paciente para análise completa do risco cardiovascular
                </p>
            </div>

            <form onSubmit={handleSubmit} className="questionario-form">
                <div className="form-grid">
                    {/* Linha 1 */}
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

                    <div className="form-group">
                        <label htmlFor="chestPainType">Tipo de Dor no Peito</label>
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

                    {/* Linha 2 */}
                    <div className="form-group">
                        <label htmlFor="restingBloodPressure">Pressão Arterial</label>
                        <input
                            type="number"
                            id="restingBloodPressure"
                            name="restingBloodPressure"
                            value={formData.restingBloodPressure}
                            onChange={handleChange}
                            placeholder="mm Hg"
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="serumCholesterol">Colesterol</label>
                        <input
                            type="number"
                            id="serumCholesterol"
                            name="serumCholesterol"
                            value={formData.serumCholesterol}
                            onChange={handleChange}
                            placeholder="mg/dl"
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxHeartRate">Freq. Cardíaca Máxima</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value">
                                    {formData.maxHeartRate} bpm
                                </span>
                            </div>
                            <input
                                type="range"
                                id="maxHeartRate"
                                name="maxHeartRate"
                                min="60"
                                max="220"
                                value={formData.maxHeartRate}
                                onChange={handleChange}
                                className="slider"
                            />
                            <div className="slider-labels">
                                <span>60</span>
                                <span>220</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="oldpeak">
                            Depressão ST
                            <Info size={14} className="info-icon" />
                        </label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value">
                                    {formData.oldpeak.toFixed(1)}
                                </span>
                            </div>
                            <input
                                type="range"
                                id="oldpeak"
                                name="oldpeak"
                                min="0.0"
                                max="6.2"
                                step="0.1"
                                value={formData.oldpeak}
                                onChange={handleChange}
                                className="slider"
                            />
                            <div className="slider-labels">
                                <span>0.0</span>
                                <span>6.2</span>
                            </div>
                        </div>
                    </div>

                    {/* Linha 3 */}
                    <div className="form-group">
                        <label htmlFor="restingECG">ECG em Repouso</label>
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

                    <div className="form-group">
                        <label htmlFor="stSlope">Inclinação do ST</label>
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

                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Glicemia {">"} 120 mg/dl</span>
                            <div
                                className={`toggle ${formData.fastingBloodSugar === 1
                                        ? "toggle--active"
                                        : ""
                                    }`}
                                onClick={() =>
                                    handleToggleChange("fastingBloodSugar")
                                }
                            >
                                <div className="toggle-thumb"></div>
                            </div>
                            <span className="toggle-text">
                                {formData.fastingBloodSugar === 1
                                    ? "Sim"
                                    : "Não"}
                            </span>
                        </label>
                    </div>

                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Angina por Exercício</span>
                            <div
                                className={`toggle ${formData.exerciseAngina === 1
                                        ? "toggle--active"
                                        : ""
                                    }`}
                                onClick={() =>
                                    handleToggleChange("exerciseAngina")
                                }
                            >
                                <div className="toggle-thumb"></div>
                            </div>
                            <span className="toggle-text">
                                {formData.exerciseAngina === 1
                                    ? "Sim"
                                    : "Não"}
                            </span>
                        </label>
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