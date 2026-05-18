import { ChatGoogle } from "@langchain/google/node";

function validateGoogleApiKey() {
  if (!process.env.GOOGLE_API_KEY) {
    const error = new Error(
      "GOOGLE_API_KEY não foi encontrada."
    );

    error.statusCode = 500;
    throw error;
  }
}

function createGeminiModel() {
  validateGoogleApiKey();

  return new ChatGoogle({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    maxRetries: 2
  });
}

function normalizeAiResponse(response) {
  if (typeof response.text === "string") {
    return response.text;
  }

  if (typeof response.content === "string") {
    return response.content;
  }

  if (Array.isArray(response.content)) {
    return response.content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item.text) {
          return item.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "A IA respondeu, mas não consegui converter a resposta para texto.";
}

export async function sendMessageToAi(aiId, message) {
  if (!message || typeof message !== "string") {
    const error = new Error("A mensagem é obrigatória e precisa ser um texto.");
    error.statusCode = 400;
    throw error;
  }

  if (aiId !== "gemini") {
    const error = new Error("IA ainda não suportada.");
    error.statusCode = 404;
    throw error;
  }

  const model = createGeminiModel();

  const response = await model.invoke(message);

  return {
    aiId,
    answer: normalizeAiResponse(response)
  };
}