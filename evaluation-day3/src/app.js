require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const authRoutes = require("./routes/auth.routes");
const livresRoutes = require("./routes/livres.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ─── Sécurité ────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? process.env.CORS_ORIGIN?.split(",") || []
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));

// ─── Rate limiter (uniquement sur /login) ─────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Swagger ─────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Bibliothèque",
      version: "1.0.0",
      description: "API REST sécurisée pour la gestion d'une bibliothèque",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─ Routes ─
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/livres", livresRoutes);

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route non trouvée" });
});

// ─── Gestionnaire d'erreurs global ──
app.use(errorHandler);

module.exports = app;