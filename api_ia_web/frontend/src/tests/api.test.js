import { describe, expect, it, beforeEach } from "vitest";

import { api } from "../services/api";

describe("api service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve usar a baseURL do backend", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:3000");
  });

  it("deve adicionar Authorization quando existir token no localStorage", async () => {
    localStorage.setItem("api_ia_web_token", "token_teste");

    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {}
    });

    expect(config.headers.Authorization).toBe("Bearer token_teste");
  });

  it("não deve adicionar Authorization quando não existir token", async () => {
    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {}
    });

    expect(config.headers.Authorization).toBeUndefined();
  });
});