import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Activity, FileText, Heart, Bed, Clock } from "lucide-react";
import api from "../services/api";
import { type IAvaliacao, type IAvaliacaoSono } from "../types";
import "./HistoricoPage.css";

const HistoricoPage: React.FC = () => {
    const [historicoCardiaco, setHistoricoCardiaco] = useState<IAvaliacao[]>([]);
    const [historicoSono, setHistoricoSono] = useState<IAvaliacaoSono[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'cardiaco' | 'sono'>('cardiaco');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                setLoading(true);
                setError(null);

                try {
                    const responseCardiaco = await api.get<IAvaliacao[]>("/historico/coracao");
                    console.log("✅ Histórico cardíaco carregado:", responseCardiaco.data);

                    const sortedCardiaco = responseCardiaco.data.sort(
                        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
                    );
                    setHistoricoCardiaco(sortedCardiaco);

                } catch (cardiacoError: any) {
                    console.error("❌ Erro no histórico cardíaco:", cardiacoError);
                    setError("Não foi possível carregar o histórico cardíaco");
                }

                try {
                    console.log("🔍 Tentando buscar histórico de sono...");
                    const responseSono = await api.get<IAvaliacaoSono[]>("/historico/sono");
                    console.log("✅ Histórico sono carregado:", responseSono.data);

                    const sortedSono = responseSono.data.sort(
                        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
                    );
                    setHistoricoSono(sortedSono);

                } catch (sonoError: any) {
                    console.log("❌ Erro no histórico do sono:", sonoError);
                    setError("Não foi possível carregar o histórico do sono");
                    setHistoricoSono([]);
                }

            } catch (err: any) {
                console.error("💥 Erro inesperado:", err);
                setError("Erro ao carregar histórico");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorico();
    }, []);

    // Helper para gerar texto da recomendação baseado no código de resultado
    const getRecommendationText = (resultado: number, tipo: 'cardiaco' | 'sono') => {
        if (resultado === 1) {
            return tipo === 'cardiaco' 
                ? "Paciente apresenta alto risco cardiovascular. Recomenda-se acompanhamento médico especializado."
                : "Indícios de distúrbio do sono identificados. Recomenda-se consultar um especialista.";
        } else if (resultado === 0) {
            return tipo === 'cardiaco'
                ? "Paciente apresenta baixo risco cardiovascular. Mantenha hábitos saudáveis."
                : "Padrões de sono dentro da normalidade. Continue mantendo bons hábitos.";
        } else if (resultado === -1) {
            return "Análise em andamento. Aguarde o processamento da IA.";
        } else {
            return "Erro ao processar análise. Tente novamente mais tarde.";
        }
    };

    // Helper para o label e classe CSS do status
    const getStatusInfo = (resultado: number) => {
        switch (resultado) {
            case 1:
                return { label: "Alto Risco", className: "alto-risco" };
            case 0:
                return { label: "Baixo Risco", className: "baixo-risco" };
            case -1:
                return { label: "Processando", className: "processando" }; // Requer CSS
            default:
                return { label: "Erro", className: "erro" }; // Requer CSS
        }
    };

    const handleViewCardiacResult = (avaliacao: IAvaliacao) => {
        const resultado = {
            predicao: avaliacao.resultado,
            recomendacao: getRecommendationText(avaliacao.resultado, 'cardiaco'),
        };
        navigate("/resultado", {
            state: { questionario: avaliacao.questionario, resultado },
        });
    };

    const handleViewSonoResult = (avaliacao: IAvaliacaoSono) => {
        const resultado = {
            predicao: avaliacao.resultado,
            recomendacao: getRecommendationText(avaliacao.resultado, 'sono')
        };
        navigate("/resultado-sono", {
            state: {
                questionario: avaliacao.questionario,
                resultado
            },
        });
    };

    const formatarData = (data: string) => {
        try {
            return new Date(data).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "Data inválida";
        }
    };

    if (loading) return (
        <div className="loading-state">
            <Activity size={48} className="loading-spinner" />
            <p>Carregando histórico...</p>
        </div>
    );

    if (error && historicoCardiaco.length === 0 && historicoSono.length === 0) {
        return (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const isEmpty = activeTab === 'cardiaco' ? historicoCardiaco.length === 0 : historicoSono.length === 0;

    return (
        <div className="historico-container">
            <div className="historico-header">
                <h1 className="historico-title">Histórico de Avaliações</h1>
                <p className="historico-subtitle">
                    Visualize todas as avaliações realizadas
                </p>
            </div>

            <div className="historico-tabs">
                <button
                    className={`tab-button ${activeTab === 'cardiaco' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('cardiaco')}
                >
                    <Heart size={20} />
                    Avaliações Cardíacas
                    {historicoCardiaco.length > 0 && (
                        <span className="tab-badge">{historicoCardiaco.length}</span>
                    )}
                </button>

                <button
                    className={`tab-button ${activeTab === 'sono' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('sono')}
                >
                    <Bed size={20} />
                    Avaliações de Sono
                    {historicoSono.length > 0 ? (
                        <span className="tab-badge">{historicoSono.length}</span>
                    ) : (
                        <span className="tab-badge tab-badge--empty">0</span>
                    )}
                </button>
            </div>

            <div className="tab-content">
                {isEmpty ? (
                    <div className="empty-state">
                        <FileText size={64} className="empty-icon" />
                        <h3>Nenhuma avaliação encontrada</h3>
                        <p>
                            {activeTab === 'cardiaco'
                                ? "Realize sua primeira avaliação cardíaca para ver o histórico aqui."
                                : "O histórico de sono ainda não está disponível."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="historico-grid">
                        {activeTab === 'cardiaco' ? (
                            historicoCardiaco.map((item, index) => {
                                const status = getStatusInfo(item.resultado);
                                return (
                                    <div
                                        key={`cardiaco-${item.id || index}-${item.data}`}
                                        className="avaliacao-card cardiaco-card"
                                        onClick={() => handleViewCardiacResult(item)}
                                    >
                                        <div className="card-header">
                                            <div className="paciente-info">
                                                <h3 className="paciente-nome">
                                                    <User size={16} />
                                                    {item.questionario.nome || "Paciente não identificado"}
                                                </h3>
                                                <span className="paciente-idade">
                                                    <Clock size={14} />
                                                    {item.questionario.age} anos
                                                </span>
                                            </div>
                                            <div className="card-icon">
                                                <Heart size={20} />
                                            </div>
                                        </div>

                                        <div className="avaliacao-data">
                                            <div className="data-info">
                                                <Calendar size={14} />
                                                <span>{formatarData(item.data)}</span>
                                            </div>
                                            <span className={`risco-badge ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            historicoSono.map((item, index) => {
                                const status = getStatusInfo(item.resultado as number); // Cast pois a interface pode estar desatualizada
                                return (
                                    <div
                                        key={`sono-${item.id || index}-${item.data}`}
                                        className="avaliacao-card sono-card"
                                        onClick={() => handleViewSonoResult(item)}
                                    >
                                        <div className="card-header">
                                            <div className="paciente-info">
                                                <h3 className="paciente-nome">
                                                    <User size={16} />
                                                    {item.questionario.nome || "Paciente não identificado"}
                                                </h3>
                                                <span className="paciente-idade">
                                                    <Clock size={14} />
                                                    {item.questionario.age} anos
                                                </span>
                                            </div>
                                            <div className="card-icon">
                                                <Bed size={20} />
                                            </div>
                                        </div>

                                        <div className="avaliacao-data">
                                            <div className="data-info">
                                                <Calendar size={14} />
                                                <span>{formatarData(item.data)}</span>
                                            </div>

                                            <span className={`risco-badge ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoricoPage;