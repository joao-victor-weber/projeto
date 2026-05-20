import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { Dashboard } from "../pages/Dashboard";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    get: vi.fn()
  }
}));

describe("Dashboard page", () => {
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

    api.get.mockResolvedValue({
      data: {
        total: 3,
        data: [
          {
            id: "gemini",
            name: "Gemini",
            description: "IA do Google para conversas e explicações."
          },
          {
            id: "openai",
            name: "OpenAI",
            description: "IA para programação e escrita."
          },
          {
            id: "claude",
            name: "Claude",
            description: "IA para textos longos."
          }
        ]
      }
    });
  });

  it("deve renderizar o menu das IAs", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Menu de IAs" })
    ).toBeInTheDocument();

    expect(screen.getByText("Olá, Tori.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Gemini" })).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "OpenAI" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Claude" })).toBeInTheDocument();

    expect(api.get).toHaveBeenCalledWith("/api/ais");
  });

  it("deve limpar localStorage ao sair", async () => {
    localStorage.setItem("api_ia_web_token", "token_teste");

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(localStorage.getItem("api_ia_web_token")).toBeNull();
    expect(localStorage.getItem("api_ia_web_user")).toBeNull();
  });
});