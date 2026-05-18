import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  createUser,
  findUserByEmail,
  findUserByName
} from "../repositories/userRepository.js";

const SALT_ROUNDS = 10;

function validateRegisterData({ name, email, password }) {
  if (!name || typeof name !== "string") {
    const error = new Error("Nome é obrigatório.");
    error.statusCode = 400;
    throw error;
  }

  if (!email || typeof email !== "string") {
    const error = new Error("Email é obrigatório.");
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== "string") {
    const error = new Error("Senha é obrigatória.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("A senha precisa ter pelo menos 6 caracteres.");
    error.statusCode = 400;
    throw error;
  }
}

function validateLoginData({ email, password }) {
  if (!email || typeof email !== "string") {
    const error = new Error("Email é obrigatório.");
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== "string") {
    const error = new Error("Senha é obrigatória.");
    error.statusCode = 400;
    throw error;
  }
}

function validateJwtConfig() {
  if (!process.env.JWT_SECRET) {
    const error = new Error(
      "JWT_SECRET não foi encontrado. Verifique o arquivo .env."
    );
    error.statusCode = 500;
    throw error;
  }
}

function generateToken(user) {
  validateJwtConfig();

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export async function registerUser({ name, email, password }) {
  validateRegisterData({ name, email, password });

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const userWithSameEmail = await findUserByEmail(normalizedEmail);

  if (userWithSameEmail) {
    const error = new Error("Já existe um usuário com este email.");
    error.statusCode = 409;
    throw error;
  }

  const userWithSameName = await findUserByName(normalizedName);

  if (userWithSameName) {
    const error = new Error("Já existe um usuário com este nome.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await createUser({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash
  });

  return user;
}

export async function loginUser({ email, password }) {
  validateLoginData({ email, password });

  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Email ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const passwordIsValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordIsValid) {
    const error = new Error("Email ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token
  };
}