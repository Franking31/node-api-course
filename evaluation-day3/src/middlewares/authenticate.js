// src/middlewares/authenticate.js
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const { default: config } = require("../config/env");

const authenticate = async (req, res, next) => {
  try {
    // Récupération plus robuste du token (insensible à la casse)
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      authHeader = req.headers.Authorization;   // au cas où
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("Token manquant");
      err.status = 401;
      return next(err);        // ← On passe par le errorHandler
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      const err = new Error("Token mal formé");
      err.status = 401;
      return next(err);
    }

    // Vérification JWT
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Récupération de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, nom: true, email: true, role: true }
    });

    if (!user) {
      const err = new Error("Utilisateur introuvable");
      err.status = 401;
      return next(err);
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.status = 401;
      err.message = "Token expiré";
    } else if (err.name === "JsonWebTokenError") {
      err.status = 401;
      err.message = "Token invalide";
    } else {
      err.status = 401;
    }
    next(err);   
  }
};

module.exports = authenticate;