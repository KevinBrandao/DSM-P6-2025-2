import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { type IQuestionarioSono, type IResultadoSono } from "../types";
import "./ResultadoSonoPage.css";

const getGender = (gender: number) => {
    return gender === 1 ? "Masculino" : "Feminino";
};

const getOccupation = (occupation: string) => {
    const occupations: { [key: string]: string } = {
        "Nurse": "Enfermeiro(a)",
        "Doctor": "Médico(a)",
        "Engineer": "Engenheiro(a)",
        "Teacher": "Professor(a)",
        "Accountant": "Contador(a)",
        "Software Engineer": "Desenvolvedor(a)",
        "Salesperson": "Vendedor(a)",
        "Manager": "Gerente",
        "Scientist": "Cientista",
        "Lawyer": "Advogado(a)",
        "Student": "Estudante",
        "Other": "Outro",
        "Sales Representative": "Representante de Vendas"
    };
    return occupations[occupation] || occupation;
};

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
    const isHighRisk = resultado.predicao === 1;

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

    const SadIcon = () => (
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
                fill="#FFEBEE"
                stroke="#F44336"
                strokeWidth="2"
            />
            <circle cx="9" cy="10" r="1" fill="#F44336" />
            <circle cx="15" cy="10" r="1" fill="#F44336" />
            <path
                d="M8 16 C9.5 14.5 14.5 14.5 16 16"
                stroke="#F44336"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
    return (
        <div className="resultado-sono-container">
            <div className={`resultado-card ${isHighRisk
                ? "resultado-card--high-risk"
                : "resultado-card--low-risk"
                }`}
            >
                <div className="resultado-icon">
                    {isHighRisk ? (
                        <SadIcon />
                    ) : (
                        <SmileyIcon />
                    )}
                </div>

                <div
                    className={`risk-status-text ${isHighRisk ? "high-risk" : "low-risk"
                        }`}
                >
                    {isHighRisk ? "ALTO RISCO" : "BAIXO RISCO"}
                </div>

                <p className="recommendation">{resultado.recomendacao}</p>
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
                                {getGender(questionario.gender)}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Ocupação</span>
                            <span className="data-value">
                                {getOccupation(questionario.occupation)}
                            </span>
                        </div>
                        <div className="data-item-row">
                            <span className="data-label">Duração do Sono</span>
                            <span className="data-value">
                                {questionario.sleepDuration} horas
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