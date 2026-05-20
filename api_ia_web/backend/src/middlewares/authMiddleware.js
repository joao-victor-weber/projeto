import jwt from "jsonwebtoken";

function getTokenFromHeader(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(" ");

  if (parts.length !== 2) {
    return null;
  }

  const [scheme, token] = parts;

  if (scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

export function authenticate(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: "JWT_SECRET não foi encontrado. Verifique o arquivo .env."
      });
    }

    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token não enviado."
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decodedToken.userId,
      name: decodedToken.name,
      email: decodedToken.email
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Token inválido ou expirado."
    });
  }
}