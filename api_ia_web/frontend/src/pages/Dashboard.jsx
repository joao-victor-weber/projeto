import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../services/api";

export function Dashboard() {
  const navigate = useNavigate();

  const [ais, setAis] = useState([]);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("api_ia_web_user"));

  useEffect(() => {
    async function loadAis() {
      try {
        const response = await api.get("/api/ais");
        setAis(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Erro ao carregar IAs.");
      }
    }

    loadAis();
  }, []);

  function handleLogout() {
    localStorage.removeItem("api_ia_web_token");
    localStorage.removeItem("api_ia_web_user");

    navigate("/");
  }

  return (
    <main className="page-container">
      <section className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Menu de IAs</h1>
            <p>Olá, {user?.name || "usuário"}.</p>
          </div>

          <button type="button" onClick={handleLogout}>
            Sair
          </button>
        </header>

        {error && <strong className="error-message">{error}</strong>}

        <div className="ai-grid">
          {ais.map((ai) => (
            <Link className="ai-card" to={`/chat/${ai.id}`} key={ai.id}>
              <h2>{ai.name}</h2>
              <p>{ai.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}