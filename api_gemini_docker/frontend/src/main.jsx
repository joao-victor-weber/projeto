import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState([
    {
      autor: "bot",
      texto: "Olá! Pergunte algo e eu respondo usando o Gemini.",
    },
  ]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviarPergunta(event) {
    event.preventDefault();

    const texto = pergunta.trim();
    if (!texto || carregando) return;

    setErro("");
    setPergunta("");
    setCarregando(true);
    setMensagens((atual) => [...atual, { autor: "usuario", texto }]);

    try {
      const respostaHttp = await fetch(`${API_URL}/api/pergunta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: texto }),
      });

      const dados = await respostaHttp.json();

      if (!respostaHttp.ok) {
        throw new Error(dados.erro || "Erro ao conversar com o backend.");
      }

      setMensagens((atual) => [
        ...atual,
        { autor: "bot", texto: dados.resposta || "Sem resposta." },
      ]);
    } catch (error) {
      const mensagemErro = error.message || "Erro inesperado.";
      setErro(mensagemErro);
      setMensagens((atual) => [
        ...atual,
        { autor: "bot", texto: `Erro: ${mensagemErro}` },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina">
      <section className="card">
        <header className="cabecalho">
          <p className="etiqueta">Flask + Vite + Gemini</p>
          <h1>Chat Gemini</h1>
          <p>Frontend Vite integrado ao backend Flask.</p>
        </header>

        <div className="chat" aria-live="polite">
          {mensagens.map((mensagem, index) => (
            <div key={`${mensagem.autor}-${index}`} className={`mensagem ${mensagem.autor}`}>
              <strong>{mensagem.autor === "usuario" ? "Você" : "Gemini"}</strong>
              <p>{mensagem.texto}</p>
            </div>
          ))}
          {carregando && <div className="digitando">Gemini está pensando...</div>}
        </div>

        {erro && <p className="erro">{erro}</p>}

        <form className="formulario" onSubmit={enviarPergunta}>
          <input
            type="text"
            value={pergunta}
            onChange={(event) => setPergunta(event.target.value)}
            placeholder="Digite sua pergunta..."
            disabled={carregando}
          />
          <button type="submit" disabled={carregando || !pergunta.trim()}>
            {carregando ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
