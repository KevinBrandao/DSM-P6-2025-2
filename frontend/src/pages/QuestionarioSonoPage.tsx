import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Info } from "lucide-react";
import api from "../services/api";
import { type IQuestionarioSono, type IResultadoSono } from "../types";
import "./QuestionarioSonoPage.css";

const initialFormState: IQuestionarioSono = {
    nome: "",
    genero: "Male",
    idade: 35,
    ocupacao: "Engenheiro",
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

interface SliderFieldProps {
    label: React.ReactNode;
    name: keyof IQuestionarioSono;
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

const QuestionarioSonoPage: React.FC = () => {
    const [formData, setFormData] = useState<IQuestionarioSono>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ocupacoes = [
        "Engeneer", "Doctor", "Teacher", "Nurse", "Accountant",
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
                "/questionarios/sono",
                dataToSend
            );

            navigate("/resultado-sono", {
                state: {
                    questionario: dataToSend,
                    resultado: response.data,
                },
            });
        } catch (error:any) {
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
                    Analise padrões de sono e identifique possíveis distúrbios do sono
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
                            <input
                                type="number"
                                id="idade"
                                name="idade"
                                value={formData.idade}
                                onChange={handleChange}
                                min="27"
                                max="59"
                                className="input"
                                required
                            />
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
                            <div className="column-content">
                                <SliderField
                                    label="Duração do Sono"
                                    name="duracaoSono"
                                    value={formData.duracaoSono}
                                    min={5.8}
                                    max={8.5}
                                    step={0.1}
                                    unit="horas"
                                    onChange={handleChange}
                                />

                                <SliderField
                                    label={
                                        <>
                                            Qualidade do Sono
                                            <Info size={14} className="info-icon" />
                                        </>
                                    }
                                    name="qualidadeSono"
                                    value={formData.qualidadeSono}
                                    min={1}
                                    max={10}
                                    unit="/10"
                                    onChange={handleChange}
                                />

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
                                                {disturbio === "None" ? "Nenhum" : 
                                                 disturbio === "Sleep Apnea" ? "Apneia do Sono" : 
                                                 "Insônia"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid-column">
                            <div className="column-header">
                                <h4>Indicadores de Saúde</h4>
                            </div>
                            <div className="column-content">
                                <div className="form-group">
                                    <label htmlFor="categoriaIMC">Categoria de IMC</label>
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
                                    <label htmlFor="frequenciaCardiaca">Frequência Cardíaca</label>
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
                            </div>
                        </div>

                        <div className="grid-column">
                            <div className="column-header">
                                <h4>Atividade e Estilo de Vida</h4>
                            </div>
                            <div className="column-content">
                                <SliderField
                                    label="Nível de Atividade Física"
                                    name="nivelAtividadeFisica"
                                    value={formData.nivelAtividadeFisica}
                                    min={30}
                                    max={90}
                                    unit=""
                                    onChange={handleChange}
                                />

                                <SliderField
                                    label="Nível de Estresse"
                                    name="nivelEstresse"
                                    value={formData.nivelEstresse}
                                    min={3}
                                    max={8}
                                    unit="/8"
                                    onChange={handleChange}
                                />

                                <SliderField
                                    label="Passos Diários"
                                    name="passosDiarios"
                                    value={formData.passosDiarios}
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
                        {isLoading ? "Analisando..." : "Analisar Qualidade do Sono"}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
};

export default QuestionarioSonoPage;