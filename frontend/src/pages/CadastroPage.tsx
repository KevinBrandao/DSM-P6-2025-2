import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Stethoscope,
    UserPlus,
    ArrowLeft,
    Eye,
    EyeOff,
} from "lucide-react";
import "./CadastroPage.css";
import api from "../services/api";

interface FormData {
    nomeCompleto: string;
    crm: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    especialidade: string;
}

interface FormErrors {
    nomeCompleto?: string;
    crm?: string;
    email?: string;
    senha?: string;
    confirmarSenha?: string;
    especialidade?: string;
}

const CadastroPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        nomeCompleto: "",
        crm: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        especialidade: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const especialidades = [
        "Cardiologia",
        "Clínico Geral",
        "Medicina Interna",
        "Medicina Preventiva",
        "Medicina do Trabalho",
        "Geriatria",
        "Medicina de Família",
        "Outras",
    ];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validação nome completo
        if (!formData.nomeCompleto.trim()) {
            newErrors.nomeCompleto = "Nome completo é obrigatório";
        } else if (formData.nomeCompleto.trim().length < 3) {
            newErrors.nomeCompleto = "Nome deve ter pelo menos 3 caracteres";
        }

        // Validação CRM
        if (!formData.crm.trim()) {
            newErrors.crm = "CRM é obrigatório";
        } else if (!/^\d{4,6}$/.test(formData.crm.trim())) {
            newErrors.crm = "CRM deve conter entre 4 e 6 dígitos";
        }

        // Validação email
        if (!formData.email.trim()) {
            newErrors.email = "E-mail é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "E-mail inválido";
        }

        // Validação senha
        if (!formData.senha) {
            newErrors.senha = "Senha é obrigatória";
        } else if (formData.senha.length < 6) {
            newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
        }

        // Validação confirmar senha
        if (!formData.confirmarSenha) {
            newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
        } else if (formData.senha !== formData.confirmarSenha) {
            newErrors.confirmarSenha = "Senhas não coincidem";
        }

        // Validação especialidade
        if (!formData.especialidade) {
            newErrors.especialidade = "Especialidade é obrigatória";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post("/medicos", {
                nome: formData.nomeCompleto,
                crm: formData.crm,
                email: formData.email,
                senha: formData.senha,
                especialidade: formData.especialidade
            });

            console.log("Cadastro realizado com sucesso:", response.data);

            navigate("/", {
                state: {
                    message: "Cadastro realizado com sucesso! Faça login para continuar.",
                },
            });

        } catch (error: any) {
            console.error("Erro no cadastro:", error);

            let errorMessage = "Erro desconhecido. Tente novamente.";

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                errorMessage = validationErrors.map((err: any) => err.msg).join(', ');
            } else if (error.message) {
                errorMessage = "Erro ao conectar com o servidor. Verifique se o backend está rodando.";
            }

            setErrors({
                ...errors,
                email: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoltarLogin = () => {
        navigate("/");
    };

    return (
        <div className="cadastro-container">
            <div className="cadastro-content">
                <div className="cadastro-header">
                    <div className="logo-container">
                        <h1 className="logo-text">HEALTHCHECK</h1>
                        <p className="logo-subtitle">
                            Sistema de Avaliação Cardiovascular
                        </p>
                    </div>
                </div>

                <div className="cadastro-icon-section">
                    <div className="icon-circle">
                        <UserPlus size={40} />
                    </div>
                    <h2 className="cadastro-title">Cadastro de Médico</h2>
                    <p className="cadastro-subtitle">
                        Crie sua conta para acessar o sistema
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="cadastro-form">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                name="nomeCompleto"
                                placeholder="Nome completo"
                                value={formData.nomeCompleto}
                                onChange={handleInputChange}
                                className={`form-input ${errors.nomeCompleto ? "error" : ""
                                    }`}
                                autoComplete="name"
                            />
                        </div>
                        {errors.nomeCompleto && (
                            <span className="error-message">
                                {errors.nomeCompleto}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Stethoscope className="input-icon" size={20} />
                            <input
                                type="text"
                                name="crm"
                                placeholder="CRM (apenas números)"
                                value={formData.crm}
                                onChange={handleInputChange}
                                className={`form-input ${errors.crm ? "error" : ""
                                    }`}
                                maxLength={6}
                            />
                        </div>
                        {errors.crm && (
                            <span className="error-message">{errors.crm}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="E-mail"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`form-input ${errors.email ? "error" : ""
                                    }`}
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && (
                            <span className="error-message">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="senha"
                                placeholder="Senha"
                                value={formData.senha}
                                onChange={handleInputChange}
                                className={`form-input ${errors.senha ? "error" : ""
                                    }`}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {errors.senha && (
                            <span className="error-message">
                                {errors.senha}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmarSenha"
                                placeholder="Confirmar senha"
                                value={formData.confirmarSenha}
                                onChange={handleInputChange}
                                className={`form-input ${errors.confirmarSenha ? "error" : ""
                                    }`}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                        {errors.confirmarSenha && (
                            <span className="error-message">
                                {errors.confirmarSenha}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Stethoscope className="input-icon" size={20} />
                            <select
                                name="especialidade"
                                value={formData.especialidade}
                                onChange={handleInputChange}
                                className={`form-select ${errors.especialidade ? "error" : ""
                                    }`}
                            >
                                <option value="">
                                    Selecione sua especialidade
                                </option>
                                {especialidades.map((esp) => (
                                    <option key={esp} value={esp}>
                                        {esp}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.especialidade && (
                            <span className="error-message">
                                {errors.especialidade}
                            </span>
                        )}
                    </div>

                    <div className="form-buttons">
                        <button
                            type="submit"
                            className={`btn btn-primary btn-large ${isLoading ? "loading" : ""
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    Cadastrando...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    Cadastrar
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleVoltarLogin}
                            className="btn btn-secondary btn-large"
                            disabled={isLoading}
                        >
                            <ArrowLeft size={20} />
                            Voltar para Login
                        </button>
                    </div>
                </form>

                <div className="cadastro-footer">
                    <p>Ao se cadastrar, você concorda com nossos</p>
                    <a href="#" className="link">
                        Termos de Uso
                    </a>
                    <span> e </span>
                    <a href="#" className="link">
                        Política de Privacidade
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CadastroPage;
