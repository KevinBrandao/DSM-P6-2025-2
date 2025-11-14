import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Shield, Clock, Users, Heart, Bed } from "lucide-react";
import "./HomePage.css";

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            
            <div className="welcome-section">
                <div className="welcome-card card">
                    <div className="welcome-icon">
                        <Activity size={48} />
                    </div>
                    <h2>Sistema de Análise de Saúde</h2>
                    <p>
                        Utilize nossas ferramentas baseadas em IA para avaliações
                        precisas em minutos.
                    </p>

                    <div className="modules-section">
                        <button
                            onClick={() => navigate("/questionario")}
                            className="module-btn module-btn--heart"
                        >
                            <Heart size={20} />
                            <span>Avaliação Cardíaca</span>
                        </button>

                        <button
                            onClick={() => navigate("/questionario-sono")}
                            className="module-btn module-btn--sleep"
                        >
                            <Bed size={20} />
                            <span>Avaliação de Sono</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <div className="feature-card card">
                    <Shield className="feature-icon" size={24} />
                    <h3>Seguro e Confiável</h3>
                    <p>Baseado em dados médicos validados</p>
                </div>

                <div className="feature-card card">
                    <Clock className="feature-icon" size={24} />
                    <h3>Resultado Rápido</h3>
                    <p>Análise completa em poucos minutos</p>
                </div>

                <div className="feature-card card">
                    <Users className="feature-icon" size={24} />
                    <h3>Para Profissionais</h3>
                    <p>Ferramenta desenvolvida para médicos</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
