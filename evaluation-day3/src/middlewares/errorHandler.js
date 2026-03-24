const { default: config } = require("../config/env");

function errorHandler(err, req, res, next) {
  // Log sans données sensibles (pas de req.body, pas du header Authorization)
  console.error(`[ERROR] ${err.name || "Error"}: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    status: err.status || 500,
  });

  // Erreurs Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "Validation échouée",
      details: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
  }

  // Erreurs Prisma — unicité
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, error: "Cette valeur existe déjà" });
  }

  const status = err.status || 500;

  // En production, on masque les détails des erreurs 5xx
  if (status >= 500 && config.NODE_ENV === "production") {
    return res.status(status).json({
      success: false,
      error: "Erreur interne du serveur",
    });
  }

  return res.status(status).json({
    success: false,
    error: err.message || "Erreur interne du serveur",
  });
}

module.exports = errorHandler;