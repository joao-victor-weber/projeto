import {
  loginUser,
  registerUser
} from "../services/authService.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({
      name,
      email,
      password
    });

    return res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso.",
      data: user
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Erro interno no servidor"
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({
      email,
      password
    });

    return res.json({
      success: true,
      message: "Login realizado com sucesso.",
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Erro interno no servidor"
    });
  }
}