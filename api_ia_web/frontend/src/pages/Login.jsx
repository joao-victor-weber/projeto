import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../services/api";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("api_ia_web_token", response.data.data.token);
      localStorage.setItem(
        "api_ia_web_user",
        JSON.stringify(response.data.data.user)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-container">
      <section className="card">
        <h1>Entrar</h1>
        <p>Acesse sua plataforma de IAs.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <strong className="error-message">{error}</strong>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link to="/register">Criar conta</Link>
      </section>
    </main>
  );
}