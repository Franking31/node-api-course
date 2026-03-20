function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);

  // Erreurs Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "Validation echouee",
      details: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
  }

  // Erreurs Prisma - unicite
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, error: "Cette valeur existe deja" });
  }

  // Erreur generique
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    error: err.message || "Erreur interne du serveur",
  });
}

module.exports = errorHandler;