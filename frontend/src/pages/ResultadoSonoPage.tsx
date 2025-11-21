import React, { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Cell
} from "recharts";
import jsPDF from "jspdf";
import {
    Download, ChevronDown, ChevronUp, Moon,
    AlertTriangle, CheckCircle, ArrowLeft, Zap
} from "lucide-react";
import { type IQuestionarioSono, type IResultadoSono } from "../types";
import "./ResultadoSonoPage.css";

// --- SCHEMAS DE TRADUÇÃO ---

const getOccupation = (occupation: string) => {
    const occupations: { [key: string]: string } = {
        "Engineer": "Engenheiro(a)",
        "Doctor": "Médico(a)",
        "Teacher": "Professor(a)",
        "Nurse": "Enfermeiro(a)",
        "Accountant": "Contador(a)",
        "Software Engineer": "Dev. Software",
        "Sales Representative": "Rep. Vendas",
        "Manager": "Gerente",
        "Lawyer": "Advogado(a)",
        "Salesperson": "Vendedor(a)",
        "Scientist": "Cientista",
        "Other": "Outro"
    };
    return occupations[occupation] || occupation;
};

const getBMICategory = (category: string) => {
    const categories: { [key: string]: string } = {
        "Normal": "Peso Normal",
        "Normal Weight": "Peso Normal",
        "Overweight": "Sobrepeso",
        "Obese": "Obesidade"
    };
    return categories[category] || category;
};

const getGenderLabel = (gender: number) => (gender === 1 ? "Masculino" : "Feminino");

// --- COMPONENTE PRINCIPAL ---

const ResultadoSonoPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedRec, setExpandedRec] = useState<number | null>(0);

    const state = location.state as {
        questionario: IQuestionarioSono;
        resultado: IResultadoSono;
    } | null;

    if (!state?.questionario || !state?.resultado) {
        return <Navigate to="/questionario-sono" replace />;
    }

    const { questionario, resultado } = state;
    const isHighRisk = resultado.predicao === 1;

    const chartData = [
        {
            name: "Qualidade",
            valor: questionario.qualityOfSleep,
            ideal: 8,
            full: 10
        },
        {
            name: "Estresse",
            valor: questionario.stressLevel,
            ideal: 4,
            full: 10
        },
        {
            name: "Duração (h)",
            valor: questionario.sleepDuration,
            ideal: 8,
            full: 12
        }
    ];

    const recomendacoes = isHighRisk ? [
        {
            titulo: "Higiene do Sono",
            detalhe: "Evite telas (celular, TV) pelo menos 1 hora antes de dormir. Mantenha o quarto escuro e silencioso."
        },
        {
            titulo: "Gerenciamento de Estresse",
            detalhe: "Considere práticas como meditação ou leitura leve. Seu nível de estresse impacta diretamente a recuperação noturna."
        },
        {
            titulo: "Avaliação Profissional",
            detalhe: "Seus padrões indicam possível apneia ou insônia. Procure um especialista em sono."
        }
    ] : [
        {
            titulo: "Manutenção da Rotina",
            detalhe: "Tente dormir e acordar nos mesmos horários, inclusive aos finais de semana."
        },
        {
            titulo: "Atividade Física",
            detalhe: "Continue praticando exercícios, mas evite treinos intensos muito próximos da hora de dormir."
        }
    ];

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor(75, 0, 130);
        doc.text("Análise de Qualidade do Sono - HealthCheck", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Paciente: ${questionario.nome}`, 20, 40);
        doc.text(`Resultado: ${isHighRisk ? "INDICÍOS DE DISTÚRBIO" : "PADRÃO NORMAL"}`, 20, 50);

        doc.setFontSize(14);
        doc.text("Ficha Técnica Completa:", 20, 70);
        doc.setFontSize(10);
        
        let y = 80;
        const lineHeight = 7;
        
        doc.text(`- Idade: ${questionario.age} anos`, 25, y); y += lineHeight;
        doc.text(`- Gênero: ${getGenderLabel(questionario.gender)}`, 25, y); y += lineHeight;
        doc.text(`- Ocupação: ${getOccupation(questionario.occupation)}`, 25, y); y += lineHeight;
        doc.text(`- Duração do Sono: ${questionario.sleepDuration} horas`, 25, y); y += lineHeight;
        doc.text(`- Qualidade do Sono: ${questionario.qualityOfSleep}/10`, 25, y); y += lineHeight;
        doc.text(`- Nível de Estresse: ${questionario.stressLevel}/8`, 25, y); y += lineHeight;
        doc.text(`- Atividade Física: ${questionario.physicalActivityLevel} min/dia`, 25, y); y += lineHeight;
        doc.text(`- Passos Diários: ${questionario.dailySteps}`, 25, y); y += lineHeight;
        doc.text(`- Categoria IMC: ${getBMICategory(questionario.bmiCategory)}`, 25, y); y += lineHeight;
        doc.text(`- Pressão Arterial: ${questionario.bloodPressure}`, 25, y); y += lineHeight;
        doc.text(`- Freq. Cardíaca: ${questionario.heartRate} bpm`, 25, y);

        doc.setFontSize(14);
        doc.text("Recomendação:", 20, y + 20);
        doc.setFontSize(10);
        const splitRec = doc.splitTextToSize(resultado.recomendacao, 170);
        doc.text(splitRec, 20, y + 30);

        doc.save(`relatorio_sono_${questionario.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };

    return (
        <div className="resultado-sono-container">
            <header className="resultado-page-header">
                {/* ALTERADO AQUI: navigate(-1) retorna para a página anterior */}
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
                    <div className={`resultado-status-card ${isHighRisk ? "status-high" : "status-low"}`}>
                        <div className="status-icon">
                            {isHighRisk ? <Moon size={48} /> : <CheckCircle size={48} />}
                        </div>
                        <div>
                            <h2>{isHighRisk ? "Atenção ao Sono" : "Sono Saudável"}</h2>
                            <p className="status-subtitle">{resultado.recomendacao}</p>
                        </div>
                    </div>

                    <div className="chart-card card">
                        <h3>Análise de Padrões</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 12]} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="valor" name="Seu Valor" fill="#8884d8">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === "Estresse" ? "#ff8042" : "#8884d8"} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="ideal" name="Referência" fill="#e2e8f0" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="chart-footer">Nota: Para "Estresse", valores menores são melhores.</p>
                    </div>
                </div>

                <div className="right-col">
                    <div className="recommendations-card card">
                        <h3>Recomendações Personalizadas</h3>
                        <div className="accordion">
                            {recomendacoes.map((rec, idx) => (
                                <div key={idx} className={`accordion-item ${expandedRec === idx ? 'active' : ''}`}>
                                    <button
                                        className="accordion-header"
                                        onClick={() => setExpandedRec(expandedRec === idx ? null : idx)}
                                    >
                                        <div className="accordion-title">
                                            <Zap size={18} className="accordion-icon" />
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
                        <h3>Ficha Técnica Completa</h3>
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
                                <span className="label">Gênero</span>
                                <span className="value">{getGenderLabel(questionario.gender)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Ocupação</span>
                                <span className="value" style={{ fontSize: '0.9rem' }}>{getOccupation(questionario.occupation)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Duração Sono</span>
                                <span className="value">{questionario.sleepDuration} h</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Qualidade Sono</span>
                                <span className="value">{questionario.qualityOfSleep}/10</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Nível Estresse</span>
                                <span className="value">{questionario.stressLevel}/8</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Ativ. Física</span>
                                <span className="value">{questionario.physicalActivityLevel} min</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Passos/Dia</span>
                                <span className="value">{questionario.dailySteps}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Categoria IMC</span>
                                <span className="value">{getBMICategory(questionario.bmiCategory)}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Pressão</span>
                                <span className="value">{questionario.bloodPressure}</span>
                            </div>
                            <div className="compact-item">
                                <span className="label">Freq. Cardíaca</span>
                                <span className="value">{questionario.heartRate} bpm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultadoSonoPage;