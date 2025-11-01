import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Moon } from "lucide-react";
import api from "../services/api";
import { type IQuestionarioSono, type IResultadoSono } from "../types";
import "./QuestionarioSonoPage.css";

const initialFormState: IQuestionarioSono = {
    nome: "",
    genero: "Male",
    idade: 35,
    ocupacao: "Engineer",
    duracaoSono: 7.0,
    qualidadeSono: 7,
    nivelAtividadeFisica: 60,
    nivelEstresse: 5,
    categoriaIMC: "Normal",
    pressaoArterial: "120/80",
    frequenciaCardiaca: 72,
    passosDiarios: 6000,
    disturbioSono: "None",
};

const QuestionarioSonoPage: React.FC = () => {
    const [formData, setFormData] = useState<IQuestionarioSono>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ocupacoes = [
        "Engineer", "Doctor", "Teacher", "Nurse", "Accountant",
        "Software Developer", "Sales", "Manager", "Student", "Other"
    ];

    const categoriasIMC = ["Normal", "Overweight", "Obese"];
    const disturbiosSono = ["None", "Sleep Apnea", "Insomnia"];

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
                "/questionarios-sono",
                dataToSend
            );

            navigate("/resultado-sono", {
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
        <div className="questionario-sono-container">
            <div className="questionario-sono-header">
                <h2>Avaliação da Qualidade do Sono</h2>
                <p>
                    Analise padrões de sono e identifique possíveis distúrbios do sono
                </p>
            </div>

            <form onSubmit={handleSubmit} className="questionario-sono-form">
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
                        <label htmlFor="genero">Gênero</label>
                        <select
                            id="genero"
                            name="genero"
                            value={formData.genero}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="Male">Masculino</option>
                            <option value="Female">Feminino</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="idade">Idade</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value personal">
                                    {formData.idade} anos
                                </span>
                            </div>
                            <input
                                type="range"
                                id="idade"
                                name="idade"
                                min="27"
                                max="59"
                                value={formData.idade}
                                onChange={handleChange}
                                className="slider personal"
                            />
                            <div className="slider-labels">
                                <span>27</span>
                                <span>59</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="ocupacao">Ocupação</label>
                        <select
                            id="ocupacao"
                            name="ocupacao"
                            value={formData.ocupacao}
                            onChange={handleChange}
                            className="form-select"
                        >
                            {ocupacoes.map((ocupacao) => (
                                <option key={ocupacao} value={ocupacao}>
                                    {ocupacao}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoriaIMC">IMC</label>
                        <select
                            id="categoriaIMC"
                            name="categoriaIMC"
                            value={formData.categoriaIMC}
                            onChange={handleChange}
                            className="form-select"
                        >
                            {categoriasIMC.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria === "Normal" ? "Normal" :
                                        categoria === "Overweight" ? "Sobrepeso" : "Obeso"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Linha 2 */}
                    <div className="form-group">
                        <label htmlFor="duracaoSono">Duração do Sono</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value sleep">
                                    {formData.duracaoSono.toFixed(1)}h
                                </span>
                            </div>
                            <input
                                type="range"
                                id="duracaoSono"
                                name="duracaoSono"
                                min="5.8"
                                max="8.5"
                                step="0.1"
                                value={formData.duracaoSono}
                                onChange={handleChange}
                                className="slider sleep"
                            />
                            <div className="slider-labels">
                                <span>5.8h</span>
                                <span>8.5h</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="qualidadeSono">Qualidade do Sono</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value sleep">
                                    {formData.qualidadeSono}/10
                                </span>
                            </div>
                            <input
                                type="range"
                                id="qualidadeSono"
                                name="qualidadeSono"
                                min="1"
                                max="10"
                                value={formData.qualidadeSono}
                                onChange={handleChange}
                                className="slider sleep"
                            />
                            <div className="slider-labels">
                                <span>1</span>
                                <span>10</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="disturbioSono">Distúrbio do Sono</label>
                        <select
                            id="disturbioSono"
                            name="disturbioSono"
                            value={formData.disturbioSono}
                            onChange={handleChange}
                            className="form-select"
                        >
                            {disturbiosSono.map((disturbio) => (
                                <option key={disturbio} value={disturbio}>
                                    {disturbio === "None" ? "Nenhum" : disturbio}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nivelAtividadeFisica">Atividade Física</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value health">
                                    {formData.nivelAtividadeFisica}
                                </span>
                            </div>
                            <input
                                type="range"
                                id="nivelAtividadeFisica"
                                name="nivelAtividadeFisica"
                                min="30"
                                max="90"
                                value={formData.nivelAtividadeFisica}
                                onChange={handleChange}
                                className="slider health"
                            />
                            <div className="slider-labels">
                                <span>30</span>
                                <span>90</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nivelEstresse">Nível de Estresse</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value health">
                                    {formData.nivelEstresse}/8
                                </span>
                            </div>
                            <input
                                type="range"
                                id="nivelEstresse"
                                name="nivelEstresse"
                                min="3"
                                max="8"
                                value={formData.nivelEstresse}
                                onChange={handleChange}
                                className="slider health"
                            />
                            <div className="slider-labels">
                                <span>3</span>
                                <span>8</span>
                            </div>
                        </div>
                    </div>

                    {/* Linha 3 */}
                    <div className="form-group">
                        <label htmlFor="pressaoArterial">Pressão Arterial</label>
                        <input
                            type="text"
                            id="pressaoArterial"
                            name="pressaoArterial"
                            placeholder="Ex: 120/80"
                            value={formData.pressaoArterial}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="frequenciaCardiaca">Freq. Cardíaca</label>
                        <input
                            type="number"
                            id="frequenciaCardiaca"
                            name="frequenciaCardiaca"
                            min="65"
                            max="86"
                            value={formData.frequenciaCardiaca}
                            onChange={handleChange}
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="passosDiarios">Passos Diários</label>
                        <div className="slider-container">
                            <div className="slider-header">
                                <span className="slider-value health">
                                    {formData.passosDiarios.toLocaleString()}
                                </span>
                            </div>
                            <input
                                type="range"
                                id="passosDiarios"
                                name="passosDiarios"
                                min="3000"
                                max="10000"
                                step="100"
                                value={formData.passosDiarios}
                                onChange={handleChange}
                                className="slider health"
                            />
                            <div className="slider-labels">
                                <span>3.000</span>
                                <span>10.000</span>
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
                        {isLoading ? "Analisando..." : "Analisar Qualidade do Sono"}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
};

export default QuestionarioSonoPage;