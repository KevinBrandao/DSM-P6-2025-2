import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { type IQuestionario, type IResultado } from "../types";
import "./ResultadoPage.css";

const getChestPainType = (type: number) => {
    const types = [
        "Angina Típica",
        "Angina Atípica",
        "Dor Não-anginosa",
        "Assintomático",
    ];
    return types[type - 1] || "Não especificado";
};

const getRestingECG = (type: number) => {
    const types = [
        "Normal",
        "Anormalidade da onda ST-T",
        "Hipertrofia ventricular esquerda",
    ];
    return types[type] || "Não especificado";
};

const getStSlope = (type: number) => {
    const types = ["Normal", "Ascendente", "Descendente"];
    return types[type] || "Não especificado";
};

const ResultadoPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as {
        questionario: IQuestionario;
        resultado: IResultado;
    } | null;

    if (!state?.questionario || !state?.resultado) {
        return <Navigate to="/questionario" replace />;
    }

    const { questionario, resultado } = state;
    const isHighRisk = resultado.predicao === 1;

    // SVG para o ícone de "smiley" (usado apenas para baixo risco)
    const SmileyIcon = () => (
        <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                fill="#E8F5E9"
                stroke="#4CAF50"
                strokeWidth="2"
            />
            <circle cx="9" cy="10" r="1" fill="#4CAF50" />
            <circle cx="15" cy="10" r="1" fill="#4CAF50" />
            <path
                d="M8 16 C9.5 17.5 14.5 17.5 16 16"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );

    return (
        <div className="resultado-container">
            <div
                className={`resultado-card ${
                    isHighRisk
                        ? "resultado-card--high-risk"
                        : "resultado-card--low-risk"
                }`}
            >
                <div className="resultado-icon">
                    {/* Usa smiley para baixo risco, AlertTriangle para alto risco */}
                    {isHighRisk ? (
                        <AlertTriangle size={48} color="#ff3407ff" />
                    ) : (
                        <SmileyIcon />
                    )}
                </div>

                {/* Remove o h2 "Resultado da Avaliação" e transforma risk-badge em título principal */}
                <div
                    className={`risk-status-text ${
                        isHighRisk ? "high-risk" : "low-risk"
                    }`}
                >
                    {isHighRisk ? "ALTO RISCO" : "BAIXO RISCO"}
                </div>

                <p className="recommendation">{resultado.recomendacao}</p>
            </div>

            <div className="summary-card card">
                <div className="summary-header">
                    {/* Remove o ícone User e muda o título */}
                    <h3>Resumo dos Dados Enviados</h3>
                </div>

                <div className="patient-info">
                    {/* Transforma toda a estrutura em uma lista simples com linhas tracejadas */}
                    <div className="data-list">
                        <div className="data-item-row">
                            <span className="data-label">Nome do Paciente</span>
                            <span className="data-value">
                                {questionario.nome || "Não Informado"}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Idade</span>
                            <span className="data-value">
                                {questionario.age}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Sexo</span>
                            <span className="data-value">
                                {questionario.sex === 1
                                    ? "Masculino"
                                    : "Feminino"}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Dor no Peito</span>
                            <span className="data-value">
                                {questionario.chestPainType}:{" "}
                                {getChestPainType(questionario.chestPainType)}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Pressão Arterial</span>
                            <span className="data-value">
                                {questionario.restingBloodPressure} mm Hg
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Colesterol</span>
                            <span className="data-value">
                                {questionario.serumCholesterol} mg/dl
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">
                                Glicemia {">"} 120
                            </span>
                            <span className="data-value">
                                {questionario.fastingBloodSugar === 1
                                    ? "Sim"
                                    : "Não"}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">ECG em Repouso</span>
                            <span className="data-value">
                                {questionario.restingECG}:{" "}
                                {getRestingECG(questionario.restingECG)}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Freq. Card. Máx.</span>
                            <span className="data-value">
                                {questionario.maxHeartRate}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">
                                Angina por Exerc.
                            </span>
                            <span className="data-value">
                                {questionario.exerciseAngina === 1
                                    ? "Sim"
                                    : "Não"}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Oldpeak</span>
                            <span className="data-value">
                                {questionario.oldpeak.toFixed(1)}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Inclinação ST</span>
                            <span className="data-value">
                                {questionario.stSlope}:{" "}
                                {getStSlope(questionario.stSlope)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                {/* Remove o ícone ArrowLeft e muda o texto */}
                <button
                    onClick={() => navigate("/home")}
                    className="btn btn-primary"
                >
                    Finalizar e Voltar
                </button>
            </div>
        </div>
    );
};

export default ResultadoPage;
