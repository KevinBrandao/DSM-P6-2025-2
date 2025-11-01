import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Moon, Bed, FileText } from "lucide-react"; 
import api from "../services/api";
import { type IAvaliacaoSono } from "../types";
import "./HistoricoSonoPage.css";

const HistoricoSonoPage: React.FC = () => {
    const [historico, setHistorico] = useState<IAvaliacaoSono[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const response = await api.get<IAvaliacaoSono[]>("/historico-sono");
                const sortedData = response.data.sort(
                    (a, b) =>
                        new Date(b.data).getTime() - new Date(a.data).getTime()
                );
                setHistorico(sortedData);
            } catch {
                setError("Não foi possível carregar o histórico de sono.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorico();
    }, []);

    const handleViewResult = (avaliacao: IAvaliacaoSono) => {
        navigate("/resultado-sono", {
            state: { 
                questionario: avaliacao.questionario, 
                resultado: avaliacao.resultado 
            },
        });
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getQualityColor = (score: number) => {
        if (score >= 8) return "#10B981";
        if (score >= 6) return "#F59E0B";
        return "#EF4444";
    };

    const getQualityText = (score: number) => {
        if (score >= 8) return "Excelente";
        if (score >= 6) return "Regular";
        return "Ruim";
    };

    if (loading) return (
        <div className="loading-state">
            <Moon size={48} className="loading-spinner" />
            <p>Carregando histórico...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-state">
            <p>{error}</p>
        </div>
    );

    return (
        <div className="historico-sono-container">
            <div className="historico-sono-header">
                <h1 className="historico-sono-title">Histórico de Análises de Sono</h1>
                <p className="historico-sono-subtitle">
                    Visualize todas as avaliações de qualidade do sono realizadas
                </p>
            </div>

            {historico.length === 0 ? (
                <div className="empty-state">
                    <Bed size={64} className="empty-icon" />
                    <h3>Nenhuma análise de sono encontrada</h3>
                    <p>Realize sua primeira análise para ver o histórico aqui.</p>
                </div>
            ) : (
                <div className="historico-sono-grid">
                    {historico.map((item, index) => (
                        <div
                            key={`${item.data}-${index}`}
                            className="avaliacao-sono-card"
                            onClick={() => handleViewResult(item)}
                        >
                            <div className="card-header">
                                <div className="paciente-info">
                                    <h3 className="paciente-nome">
                                        <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                        {item.questionario.nome || "Paciente não identificado"}
                                    </h3>
                                    <p className="avaliacao-data">
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                        {formatarData(item.data)}
                                    </p>
                                </div>
                                <div 
                                    className="quality-badge"
                                    style={{ backgroundColor: getQualityColor(item.resultado.scoreQualidade) }}
                                >
                                    {getQualityText(item.resultado.scoreQualidade)}
                                </div>
                            </div>

                            <div className="quality-score-display">
                                <Moon size={16} />
                                <span>Score: {item.resultado.scoreQualidade}/10</span>
                            </div>

                            <div className="avaliacao-detalhes">
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Duração</span>
                                    <span className="detalhe-value">
                                        {item.questionario.duracaoSono.toFixed(1)}h
                                    </span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Qualidade</span>
                                    <span className="detalhe-value">
                                        {item.questionario.qualidadeSono}/10
                                    </span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Atividade</span>
                                    <span className="detalhe-value">
                                        {item.questionario.nivelAtividadeFisica}
                                    </span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Estresse</span>
                                    <span className="detalhe-value">
                                        {item.questionario.nivelEstresse}/8
                                    </span>
                                </div>
                            </div>

                            {item.resultado.disturbiosIdentificados.length > 0 && (
                                <div className="disturbios-alert">
                                    <Bed size={14} />
                                    <span>Distúrbios: {item.resultado.disturbiosIdentificados.join(", ")}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoricoSonoPage;   