import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, RefreshCw } from "lucide-react";
import api from "../services/api";
import { type IQuestionarioSono, type IAvaliacaoSono, type IResultadoSono } from "../types";
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
    const [formData, setFormData] = useState<IQuestionarioSono>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // @ts-ignore: avaliacaoId mantido para consistência futura, mesmo que não usado diretamente no render
    const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
    const navigate = useNavigate();

    const ocupacoes = [
        { "Nome": "Engenheiro(a)", "Value": "Engineer" },
        { "Nome": "Médico(a)", "Value": "Doctor" },
        { "Nome": "Professor(a)", "Value": "Teacher" },
        { "Nome": "Enfermeiro(a)", "Value": "Nurse" },
        { "Nome": "Contador(a)", "Value": "Accountant" },
        { "Nome": "Engenheiro(a) de Software", "Value": "Software Engineer" },
        { "Nome": "Representante de Vendas", "Value": "Sales Representative" },
        { "Nome": "Gerente", "Value": "Manager" },
        { "Nome": "Advogado(a)", "Value": "Lawyer" },
        { "Nome": "Vendedor(a)", "Value": "Salesperson" },
        { "Nome": "Cientista", "Value": "Scientist" }
    ];

    const categoriasIMC = ["Normal", "Overweight", "Obese"];

    // Função de polling adaptada para o Sono
    const pollResultado = async (id: string, attempts = 0): Promise<IResultadoSono> => {
        const maxAttempts = 36; // 36 tentativas (6 minutos no total)

        const getInterval = (attempt: number) => {
            if (attempt < 3) return 10000; // 10 segundos
            if (attempt < 6) return 15000; // 15 segundos
            return 20000; // 20 segundos
        };

        try {
            console.log(`🔄 Polling tentativa ${attempts + 1}/${maxAttempts} para: ${id}`);

            // Busca histórico de sono
            const response = await api.get<IAvaliacaoSono[]>("/historico/sono");

            const avaliacao = response.data.find(item => item.id === id);

            if (!avaliacao) {
                console.log(`⏳ Avaliação ${id} ainda não está no histórico (processando...)`);
                if (attempts < maxAttempts) {
                    const interval = getInterval(attempts);
                    await new Promise(resolve => setTimeout(resolve, interval));
                    return pollResultado(id, attempts + 1);
                } else {
                    throw new Error("Tempo limite excedido. A avaliação ainda está sendo processada.");
                }
            }

            console.log("✅ Avaliação encontrada no histórico:", avaliacao);

            // Verifica se ainda está processando (resultado -1)
            // @ts-ignore: Assumindo que o backend retorna resultado numérico similar ao coração
            if (avaliacao.resultado === -1 && attempts < maxAttempts) {
                console.log(`⏳ Avaliação encontrada mas ainda processando (resultado: -1)`);
                const interval = getInterval(attempts);
                await new Promise(resolve => setTimeout(resolve, interval));
                return pollResultado(id, attempts + 1);
            }

            if (attempts >= maxAttempts) {
                throw new Error("Processamento está demorando mais que o normal. Verifique o histórico mais tarde.");
            }

            console.log("🎯 Resultado final obtido:", avaliacao.resultado);

            // Retorna objeto compatível com IResultadoSono
            // Ajuste a lógica de recomendação conforme a regra de negócio do seu backend (0 = bom, 1 = ruim)
            return {
                // @ts-ignore: Ajuste de tipagem conforme backend
                predicao: avaliacao.resultado,
                // @ts-ignore: Ajuste de tipagem conforme backend
                resultado: avaliacao.resultado,
                recomendacao: avaliacao.resultado === 1
                    ? "Indícios de distúrbio do sono identificados. Recomenda-se consultar um especialista."
                    : "Padrões de sono dentro da normalidade. Continue mantendo bons hábitos."
            } as unknown as IResultadoSono;

        } catch (error: any) {
            console.error("❌ Erro no polling:", error);

            if (attempts < maxAttempts && (error.message?.includes('Network') || error.message?.includes('timeout'))) {
                console.log(`🌐 Erro de rede, tentando novamente em 10s...`);
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

            console.log("📤 Enviando dados de sono:", dataToSend);

            // Envia para o endpoint de sono
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

            console.log("📥 Resposta da API:", response.data);
            const { avaliacao } = response.data;

            if (!avaliacao || typeof avaliacao.resultado === 'undefined') {
                throw new Error("Resposta da API em formato inválido");
            }

            // Se resultado imediato
            if (avaliacao.resultado !== -1) {
                navigate("/resultado-sono", {
                    state: {
                        questionario: dataToSend,
                        resultado: {
                            predicao: avaliacao.resultado,
                            recomendacao: avaliacao.resultado === 1
                                ? "Indícios de distúrbio do sono identificados."
                                : "Padrões de sono normais."
                        },
                    },
                });
                return;
            }

            // Inicia Polling
            console.log("🔄 Iniciando polling via histórico para avaliação:", avaliacao.id);
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
                error.message || "Houve um erro ao enviar o questionário. Tente novamente."
            );
            setIsPolling(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="questionario-container">

            {/* Overlay de Polling Adicionado */}
            {isPolling && (
                <div className="polling-overlay">
                    <div className="polling-content">
                        <RefreshCw size={32} className="polling-spinner" />
                        <h3>Processando Avaliação do Sono</h3>

                        <div className="polling-steps">
                            <div className="step active">
                                <div className="step-number">1</div>
                                <div className="step-text">Questionário enviado</div>
                            </div>
                            <div className="step active">
                                <div className="step-number">2</div>
                                <div className="step-text">Na fila de processamento</div>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <div className="step-text">IA analisando dados</div>
                            </div>
                            <div className="step">
                                <div className="step-number">4</div>
                                <div className="step-text">Resultado pronto</div>
                            </div>
                        </div>

                        <div className="polling-info">
                            <p><strong>Status:</strong> Aguardando processamento pela mensageria...</p>
                            <p><strong>Tempo estimado:</strong> 1-3 minutos</p>
                            <p><small>O sistema verifica automaticamente a cada 10-20 segundos</small></p>
                        </div>

                        <div className="polling-actions">
                            <button
                                onClick={() => {
                                    setIsPolling(false);
                                    navigate("/historico");
                                }}
                                className="btn btn-secondary"
                            >
                                Ver Histórico
                            </button>
                            <button
                                onClick={() => {
                                    setIsPolling(false);
                                    navigate("/home");
                                }}
                                className="btn btn-outline"
                            >
                                Voltar para Home
                            </button>
                        </div>
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