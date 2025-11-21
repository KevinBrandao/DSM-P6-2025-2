import React, { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip
} from "recharts";
import jsPDF from "jspdf";
import {
    Download, ChevronDown, ChevronUp, Activity,
    AlertTriangle, CheckCircle, ArrowLeft, Clock, XCircle
} from "lucide-react";
import { type IQuestionario, type IResultado } from "../types";
import "./ResultadoPage.css";

// Helpers de formatação
const getChestPainType = (type: number) => {
    const types = ["Angina Típica", "Angina Atípica", "Dor Não-anginosa", "Assintomático"];
    return types[type - 1] || "Não especificado";
};

const getRestingECG = (type: number) => {
    const types = ["Normal", "Anormalidade ST-T", "Hipertrofia VE"];
    return types[type] || "Não especificado";
};

const getStSlope = (type: number) => {
    const types = ["Ascendente", "Normal", "Descendente"];
    return types[type - 1] || "Não especificado";
};

const getSexLabel = (sex: number) => (sex === 1 ? "Masculino" : "Feminino");
const getBooleanLabel = (val: number) => (val === 1 ? "Sim" : "Não");

const ResultadoPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedRec, setExpandedRec] = useState<number | null>(0);

    const state = location.state as {
        questionario: IQuestionario;
        resultado: IResultado;
    } | null;

    if (!state?.questionario || !state?.resultado) {
        return <Navigate to="/questionario" replace />;
    }

    const { questionario, resultado } = state;
    const predicao = resultado.predicao;

    // Configuração de exibição baseada na predição
    const getStatusConfig = (val: number) => {
        switch (val) {
            case 1:
                return {
                    class: "status-high",
                    icon: <AlertTriangle size={48} />,
                    title: "Alto Risco Identificado",
                    subtitle: "Baseado na análise dos parâmetros clínicos fornecidos.",
                    pdfText: "ALTO RISCO"
                };
            case 0:
                return {
                    class: "status-low",
                    icon: <CheckCircle size={48} />,
                    title: "Baixo Risco Identificado",
                    subtitle: "Baseado na análise dos parâmetros clínicos fornecidos.",
                    pdfText: "BAIXO RISCO"
                };
            case -1:
                return {
                    class: "status-processing", // Sugestão: adicionar estilo laranja/azul neutro no CSS
                    icon: <Clock size={48} />,
                    title: "Em Processamento",
                    subtitle: "A inteligência artificial está analisando seus dados.",
                    pdfText: "EM PROCESSAMENTO"
                };
            case -2:
            default:
                return {
                    class: "status-error", // Sugestão: adicionar estilo vermelho escuro/cinza no CSS
                    icon: <XCircle size={48} />,
                    title: "Erro no Processamento",
                    subtitle: "Ocorreu um erro ao analisar seus dados.",
                    pdfText: "ERRO"
                };
        }
    };

    const statusConfig = getStatusConfig(predicao);

    const chartData = [
        {
            subject: "Pressão Arterial",
            A: questionario.restingBloodPressure,
            fullMark: 200,
            ref: 120,
        },
        {
            subject: "Freq. Cardíaca",
            A: questionario.maxHeartRate,
            fullMark: 220,
            ref: 150,
        },
        {
            subject: "Colesterol",
            A: questionario.serumCholesterol,
            fullMark: 300,
            ref: 200,
        },
    ];

    // Definição das recomendações baseadas no status
    let recomendacoesDetalhadas = [];

    if (predicao === 1) {
        recomendacoesDetalhadas = [
            {
                titulo: "Consulte um Cardiologista",
                detalhe: "Agende uma consulta com urgência para realizar exames complementares como Teste Ergométrico ou Ecocardiograma."
            },
            {
                titulo: "Monitoramento de Pressão",
                detalhe: "Recomenda-se aferir a pressão arterial diariamente em horários variados e anotar os resultados."
            },
            {
                titulo: "Ajuste na Dieta",
                detalhe: "Reduza o consumo de sódio (sal) e gorduras saturadas. Priorize frutas, legumes e grãos integrais."
            }
        ];
    } else if (predicao === 0) {
        recomendacoesDetalhadas = [
            {
                titulo: "Manutenção de Hábitos",
                detalhe: "Continue com sua rotina atual de exercícios e alimentação equilibrada."
            },
            {
                titulo: "Check-up Anual",
                detalhe: "Mesmo com baixo risco, é importante realizar exames de rotina anualmente."
            }
        ];
    } else if (predicao === -1) {
        recomendacoesDetalhadas = [
            {
                titulo: "Aguarde a Análise",
                detalhe: "Seus dados foram enviados e estão sendo processados. Verifique o histórico em alguns minutos para o resultado final."
            }
        ];
    } else {
        recomendacoesDetalhadas = [
            {
                titulo: "Tente Novamente",
                detalhe: "Houve um problema técnico. Por favor, tente reenviar o questionário mais tarde."
            }
        ];
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text("Relatório de Avaliação Cardíaca - HealthCheck", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Paciente: ${questionario.nome}`, 20, 40);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 50);
        doc.text(`Resultado: ${statusConfig.pdfText}`, 20, 60);

        doc.setFontSize(14);
        doc.text("Dados Clínicos Completos:", 20, 80);
        doc.setFontSize(10);
        
        let y = 90;
        const lineHeight = 7;
        
        doc.text(`- Idade: ${questionario.age} anos`, 25, y); y += lineHeight;
        doc.text(`- Sexo: ${getSexLabel(questionario.sex)}`, 25, y); y += lineHeight;
        doc.text(`- Pressão Arterial: ${questionario.restingBloodPressure} mmHg`, 25, y); y += lineHeight;
        doc.text(`- Colesterol: ${questionario.serumCholesterol} mg/dl`, 25, y); y += lineHeight;
        doc.text(`- Glicemia Jejum > 120: ${getBooleanLabel(questionario.fastingBloodSugar)}`, 25, y); y += lineHeight;
        doc.text(`- Dor no Peito: ${getChestPainType(questionario.chestPainType)}`, 25, y); y += lineHeight;
        doc.text(`- ECG Repouso: ${getRestingECG(questionario.restingECG)}`, 25, y); y += lineHeight;
        doc.text(`- Freq. Cardíaca Máx: ${questionario.maxHeartRate} bpm`, 25, y); y += lineHeight;
        doc.text(`- Angina por Exercício: ${getBooleanLabel(questionario.exerciseAngina)}`, 25, y); y += lineHeight;
        doc.text(`- Oldpeak: ${questionario.oldpeak}`, 25, y); y += lineHeight;
        doc.text(`- Inclinação ST: ${getStSlope(questionario.stSlope)}`, 25, y);

        doc.setFontSize(14);
        doc.text("Recomendação Principal:", 20, y + 20);
        doc.setFontSize(10);
        const splitRecomendacao = doc.splitTextToSize(resultado.recomendacao || "Sem recomendação disponível.", 170);
        doc.text(splitRecomendacao, 20, y + 30);

        doc.save(`relatorio_cardio_${questionario.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };

    return (
        <div className="resultado-container">
            <header className="resultado-page-header">
                <button onClick={() => navigate(-1)} className="back-link">
                    <ArrowLeft size={20} />
                    <span>Voltar</span>
                </button>
                <button onClick={handleDownloadPDF} className="btn-download">
                    <Download size={18} />
                    Baixar PDF
                </button>
            </header>

            <div className="resultado-grid">
                <div className="left-col">
                    <div className={`resultado-status-card ${statusConfig.class}`}>
                        <div className="status-icon">
                            {statusConfig.icon}
                        </div>
                        <div>
                            <h2>{statusConfig.title}</h2>
                            <p className="status-subtitle">{statusConfig.subtitle}</p>
                        </div>
                    </div>

                    <div className="chart-card card">
                        <h3>Comparativo Clínico</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                                    <Radar
                                        name="Paciente"
                                        dataKey="A"
                                        stroke="#2563eb"
                                        fill="#2563eb"
                                        fillOpacity={0.6}
                                    />
                                    <Radar
                                        name="Referência"
                                        dataKey="ref"
                                        stroke="#94a3b8"
                                        fill="#94a3b8"
                                        fillOpacity={0.3}
                                    />
                                    <Legend />
                                    <RechartsTooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="right-col">
                    <div className="recommendations-card card">
                        <h3>Plano de Ação Recomendado</h3>
                        <div className="accordion">
                            {recomendacoesDetalhadas.map((rec, idx) => (
                                <div key={idx} className={`accordion-item ${expandedRec === idx ? 'active' : ''}`}>
                                    <button
                                        className="accordion-header"
                                        onClick={() => setExpandedRec(expandedRec === idx ? null : idx)}
                                    >
                                        <div className="accordion-title">
                                            <Activity size={18} className="accordion-icon" />
                                            <span>{rec.titulo}</span>
                                        </div>
                                        {expandedRec === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    {expandedRec === idx && (
                                        <div className="accordion-content">
                                            <p>{rec.detalhe}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="summary-compact-card card">
                        <h3>Dados Completos Enviados</h3>
                        <div className="compact-grid">
                            <div className="compact-item">
                                <span className="label">Paciente</span>
                                <span className="value">{questionario.nome}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Idade</span>
                                <span className="value">{questionario.age} anos</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Sexo</span>
                                <span className="value">{getSexLabel(questionario.sex)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Pressão Arterial</span>
                                <span className="value">{questionario.restingBloodPressure} mmHg</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Colesterol</span>
                                <span className="value">{questionario.serumCholesterol} mg/dl</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Glicemia {'>'} 120</span>
                                <span className="value">{getBooleanLabel(questionario.fastingBloodSugar)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Tipo Dor Peito</span>
                                <span className="value" style={{ fontSize: '0.9rem' }}>{getChestPainType(questionario.chestPainType)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">ECG Repouso</span>
                                <span className="value" style={{ fontSize: '0.9rem' }}>{getRestingECG(questionario.restingECG)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Freq. Card. Máx</span>
                                <span className="value">{questionario.maxHeartRate} bpm</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Angina Exerc.</span>
                                <span className="value">{getBooleanLabel(questionario.exerciseAngina)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Oldpeak</span>
                                <span className="value">{questionario.oldpeak}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Inclinação ST</span>
                                <span className="value">{getStSlope(questionario.stSlope)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultadoPage;