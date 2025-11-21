import React, { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Heart, Activity } from "lucide-react";
import api from "../services/api";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!email || !senha) {
			setError("Por favor, preencha o e-mail e a senha.");
			setIsLoading(false);
			return;
		}

		try {
			const response = await api.post<{ accessToken: string }>(
				"/auth/login",
				{ email, senha }
			);
			const { accessToken } = response.data;

			localStorage.setItem("token", accessToken);
			localStorage.setItem("email", email);

			navigate("/home");
		} catch {
			setError("Usuário ou senha inválidos.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			<div className="login-content">
				<div className="login-header">
					<div className="app-logo">
						<Activity size={35} />
						<span>HealthCheck</span>
					</div>
					<p className="login-subtitle">
						Acesse sua conta para continuar
					</p>
				</div>

				<form onSubmit={handleLogin} className="login-form">
					<div className="input-group">
						<Mail size={20} className="input-icon" />
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="E-mail"
							className="input"
							required
						/>
					</div>

					<div className="input-group">
						<Lock size={20} className="input-icon" />
						<input
							type="password"
							value={senha}
							onChange={(e) => setSenha(e.target.value)}
							placeholder="Senha"
							className="input"
							required
						/>
					</div>

					<button
						type="submit"
						className="btn btn-primary login-btn"
						disabled={isLoading}
					>
						{isLoading ? "Entrando..." : "Entrar"}
					</button>

					{error && <div className="error-message">{error}</div>}

					<div className="login-footer">
						<p>Não possui uma conta?</p>
						<Link to="/cadastro" className="signup-link">
							Cadastre-se aqui
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
