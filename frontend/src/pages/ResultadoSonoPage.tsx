import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { AlertTriangle, Moon, CheckCircle } from "lucide-react";
import { type IQuestionarioSono, type IResultadoSono } from "../types";
import "./ResultadoSonoPage.css";

const ResultadoSonoPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as {
        questionario: IQuestionarioSono;
        resultado: IResultadoSono;
    } | null;

    if (!state?.questionario || !state?.resultado) {
        return <Navigate to="/questionario-sono" replace />;
    }

    const { questionario, resultado } = state;
    const isPoorQuality = resultado.scoreQualidade < 7;

    const getQualityColor = (score: number) => {
        if (score >= 8) return "#10B981"; 
        if (score >= 6) return "#F59E0B"; 
        return "#EF4444"; 
    };

    const getQualityText = (score: number) => {
        if (score >= 8) return "EXCELENTE";
        if (score >= 6) return "REGULAR";
        return "RUIM";
    };

    const MoonIcon = () => (
        <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="#E8F5E9"
                stroke="#10B981"
                strokeWidth="2"
            />
        </svg>
    );

    return (
        <div className="resultado-sono-container">
            <div
                className={`resultado-sono-card ${
                    isPoorQuality
                        ? "resultado-sono-card--poor"
                        : "resultado-sono-card--good"
                }`}
            >
                <div className="resultado-sono-icon">
                    {isPoorQuality ? (
                        <AlertTriangle size={48} color="#EF4444" />
                    ) : (
                        <MoonIcon />
                    )}
                </div>

                <div className="quality-score">
                    <div className="score-circle">
                        <span className="score-number">
                            {resultado.scoreQualidade}
                        </span>
                        <span className="score-label">/10</span>
                    </div>
                    <div 
                        className="quality-status"
                        style={{ color: getQualityColor(resultado.scoreQualidade) }}
                    >
                        {getQualityText(resultado.scoreQualidade)}
                    </div>
                </div>

                <p className="recommendation">{resultado.recomendacao}</p>

                {resultado.disturbiosIdentificados.length > 0 && (
                    <div className="disturbios-alert">
                        <AlertTriangle size={16} />
                        <span>Possíveis distúrbios identificados: {resultado.disturbiosIdentificados.join(", ")}</span>
                    </div>
                )}
            </div>

            <div className="summary-card card">
                <div className="summary-header">
                    <h3>Resumo dos Dados Enviados</h3>
                </div>

                <div className="patient-info">
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
                            <span className="data-label">Gênero</span>
                            <span className="data-value">
                                {questionario.gender === 0 ? 1 : 0}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Ocupação</span>
                            <span className="data-value">
                                {questionario.occupation}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Duração do Sono</span>
                            <span className="data-value">
                                {questionario.sleepDuration.toFixed(1)} horas
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Qualidade do Sono</span>
                            <span className="data-value">
                                {questionario.qualityOfSleep}/10
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Atividade Física</span>
                            <span className="data-value">
                                {questionario.physicalActivityLevel}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Nível de Estresse</span>
                            <span className="data-value">
                                {questionario.stressLevel}/8
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">IMC</span>
                            <span className="data-value">
                                {questionario.bmiCategory === "Normal" ? "Normal" : 
                                 questionario.bmiCategory === "Overweight" ? "Sobrepeso" : "Obeso"}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Pressão Arterial</span>
                            <span className="data-value">
                                {questionario.bloodPressure}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Freq. Cardíaca</span>
                            <span className="data-value">
                                {questionario.heartRate} bpm
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Passos Diários</span>
                            <span className="data-value">
                                {questionario.dailySteps}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Distúrbio do Sono</span>
                            <span className="data-value">
                                {questionario.sleepDisorder === "None" ? "Nenhum" : questionario.sleepDisorder}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
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

export default ResultadoSonoPage;