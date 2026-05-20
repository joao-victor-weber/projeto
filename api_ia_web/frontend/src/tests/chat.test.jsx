import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { Chat } from "../pages/Chat";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    post: vi.fn()
  }
}));

function renderChat(aiId = "gemini") {
  return render(
    <MemoryRouter initialEntries={[`/chat/${aiId}`]}>
      <Routes>
        <Route path="/chat/:aiId" element={<Chat />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Chat page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    localStorage.setItem(
      "api_ia_web_user",
      JSON.stringify({
        id: 1,
        name: "Tori",
        email: "tori@test.com"
      })
    );
  });

  it("deve renderizar o chat da IA selecionada", () => {
    renderChat("gemini");

    expect(
      screen.getByRole("heading", { name: "Chat com gemini" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Nenhuma conversa ainda. Faça sua primeira pergunta.")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Digite sua mensagem...")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("deve carregar conversa salva no localStorage", () => {
    localStorage.setItem(
      "api_ia_web_conversation_user_1_gemini",
      JSON.stringify([
        {
          role: "user",
          content: "Olá"
        },
        {
          role: "assistant",
          content: "Olá, como posso ajudar?"
        }
      ])
    );

    renderChat("gemini");

    expect(screen.getByText("Olá")).toBeInTheDocument();
    expect(screen.getByText("Olá, como posso ajudar?")).toBeInTheDocument();
  });

  it("deve enviar mensagem e salvar resposta no localStorage", async () => {
    api.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          aiId: "gemini",
          answer: "Resposta da IA"
        }
      }
    });

    renderChat("gemini");

    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Digite sua mensagem..."),
      "Explique React"
    );

    await user.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(screen.getByText("Resposta da IA")).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith("/api/ais/gemini/chat", {
      message: "Explique React"
    });

    const savedConversation = JSON.parse(
      localStorage.getItem("api_ia_web_conversation_user_1_gemini")
    );

    expect(savedConversation).toEqual([
      {
        role: "user",
        content: "Explique React"
      },
      {
        role: "assistant",
        content: "Resposta da IA"
      }
    ]);
  });

  it("deve limpar conversa salva", async () => {
    localStorage.setItem(
      "api_ia_web_conversation_user_1_gemini",
      JSON.stringify([
        {
          role: "user",
          content: "Mensagem antiga"
        }
      ])
    );

    renderChat("gemini");

    expect(screen.getByText("Mensagem antiga")).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Limpar conversa" }));

    expect(localStorage.getItem("api_ia_web_conversation_user_1_gemini")).toBeNull();

    expect(
      screen.getByText("Nenhuma conversa ainda. Faça sua primeira pergunta.")
    ).toBeInTheDocument();
  });
});