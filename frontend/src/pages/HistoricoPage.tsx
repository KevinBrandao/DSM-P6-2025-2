import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Activity, FileText } from "lucide-react"; 
import api from "../services/api";
import { type IAvaliacao } from "../types";
import "./HistoricoPage.css";

const HistoricoPage: React.FC = () => {
    const [historico, setHistorico] = useState<IAvaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const response = await api.get<IAvaliacao[]>("/historico");
                // Ordena do mais recente para o mais antigo
                const sortedData = response.data.sort(
                    (a, b) =>
                        new Date(b.data).getTime() - new Date(a.data).getTime()
                );
                setHistorico(sortedData);
            } catch {
                setError("Não foi possível carregar o histórico.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorico();
    }, []);

    const handleViewResult = (avaliacao: IAvaliacao) => {
        const resultado = {
            predicao: avaliacao.resultado,
            recomendacao:
                avaliacao.resultado === 1
                    ? "Paciente apresenta alto risco cardiovascular. Recomenda-se acompanhamento médico especializado e exames complementares."
                    : "Paciente apresenta baixo risco cardiovascular. Mantenha hábitos saudáveis e acompanhamento regular.",
        };
        navigate("/resultado", {
            state: { questionario: avaliacao.questionario, resultado },
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

    if (loading) return (
        <div className="loading-state">
            <Activity size={48} className="loading-spinner" />
            <p>Carregando histórico...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-state">
            <p>{error}</p>
        </div>
    );

    return (
        <div className="historico-container">
            <div className="historico-header">
                <h1 className="historico-title">Histórico de Avaliações</h1>
                <p className="historico-subtitle">
                    Visualize todas as avaliações cardiovasculares realizadas
                </p>
            </div>

            {historico.length === 0 ? (
                <div className="empty-state">
                    <FileText size={64} className="empty-icon" />
                    <h3>Nenhuma avaliação encontrada</h3>
                    <p>Realize sua primeira avaliação para ver o histórico aqui.</p>
                </div>
            ) : (
                <div className="historico-grid">
                    {historico.map((item, index) => (
                        <div
                            key={`${item.data}-${index}`}
                            className="avaliacao-card"
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
                                <div className={`risco-badge ${item.resultado === 1 ? 'alto-risco' : 'baixo-risco'}`}>
                                    {item.resultado === 1 ? "Alto Risco" : "Baixo Risco"}
                                </div>
                            </div>

                            <div className="avaliacao-detalhes">
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Idade</span>
                                    <span className="detalhe-value">{item.questionario.age} anos</span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Sexo</span>
                                    <span className="detalhe-value">
                                        {item.questionario.sex === 1 ? "Masculino" : "Feminino"}
                                    </span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Pressão</span>
                                    <span className="detalhe-value">
                                        {item.questionario.restingBloodPressure} mmHg
                                    </span>
                                </div>
                                <div className="detalhe-item">
                                    <span className="detalhe-label">Colesterol</span>
                                    <span className="detalhe-value">
                                        {item.questionario.serumCholesterol} mg/dl
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoricoPage;