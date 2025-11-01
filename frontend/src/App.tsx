import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import HomePage from "./pages/HomePage";
import QuestionarioPage from "./pages/QuestionarioPage";
import HistoricoPage from "./pages/HistoricoPage";
import ResultadoPage from "./pages/ResultadoPage";
import MainLayout from "./components/MainLayout";
import QuestionarioSonoPage from "./pages/QuestionarioSonoPage";
import ResultadoSonoPage from "./pages/ResultadoSonoPage";

const PrivateRoute: React.FC = () => {
    const token = localStorage.getItem("token");
    return token ? (
        <MainLayout>
            <Outlet />
        </MainLayout>
    ) : (
        <Navigate to="/" />
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route
                        path="/questionario"
                        element={<QuestionarioPage />}
                    />
                    <Route path="/historico" element={<HistoricoPage />} />
                    <Route path="/resultado" element={<ResultadoPage />} />
                    <Route path="/questionario-sono" element={<QuestionarioSonoPage />} />
                    <Route path="/resultado-sono" element={<ResultadoSonoPage />} />                    
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
