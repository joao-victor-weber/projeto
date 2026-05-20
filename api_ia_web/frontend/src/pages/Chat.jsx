import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../services/api";

function getCurrentUser() {
  const savedUser = localStorage.getItem("api_ia_web_user");

  if (!savedUser) {
    return null;
  }

  return JSON.parse(savedUser);
}

function getStorageKey(aiId) {
  const user = getCurrentUser();
  const userId = user?.id || "guest";

  return `api_ia_web_conversation_user_${userId}_${aiId}`;
}

export function Chat() {
  const { aiId } = useParams();

  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedConversation = localStorage.getItem(getStorageKey(aiId));

    if (savedConversation) {
      setConversation(JSON.parse(savedConversation));
    } else {
      setConversation([]);
    }
  }, [aiId]);

  function saveConversation(nextConversation) {
    setConversation(nextConversation);

    localStorage.setItem(
      getStorageKey(aiId),
      JSON.stringify(nextConversation)
    );
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmedMessage
    };

    const conversationWithUserMessage = [...conversation, userMessage];

    saveConversation(conversationWithUserMessage);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/api/ais/${aiId}/chat`, {
        message: trimmedMessage
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.data.answer
      };

      saveConversation([
        ...conversationWithUserMessage,
        assistantMessage
      ]);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao conversar com a IA.");
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    localStorage.removeItem(getStorageKey(aiId));
    setConversation([]);
  }

  return (
    <main className="page-container">
      <section className="chat-page">
        <header className="chat-header">
          <div>
            <Link to="/dashboard">Voltar</Link>
            <h1>Chat com {aiId}</h1>
          </div>

          <button type="button" onClick={clearConversation}>
            Limpar conversa
          </button>
        </header>

        <div className="messages">
          {conversation.length === 0 && (
            <p className="empty-message">
              Nenhuma conversa ainda. Faça sua primeira pergunta.
            </p>
          )}

          {conversation.map((item, index) => (
            <article className={`message ${item.role}`} key={index}>
              <strong>{item.role === "user" ? "Você" : "IA"}</strong>
              <p>{item.content}</p>
            </article>
          ))}
        </div>

        {error && <strong className="error-message">{error}</strong>}

        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </section>
    </main>
  );
}