require("dotenv").config();
const { default: config } = require("./config/env");   // ← Keep this one only

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./docs/swagger");

const authRoutes = require("./routes/auth.routes");
const livresRoutes = require("./routes/livres.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Sécurité
app.use(helmet());

app.use(
  cors({
    origin:
      config.NODE_ENV === "production"
        ? config.ALLOWED_ORIGIN?.split(",") || []
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing
app.use(express.json({ limit: "10kb" }));

// Lire les cookies (refresh token)
const cookieParser = require("cookie-parser");
app.use(cookieParser());    

// Rate limiter global...
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Trop de requêtes. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

//  Rate limiter strict sur auth (register + login) 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Trop de tentatives. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Swagger 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true, // garde le token après refresh de page
  },
}));

// Routes 
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/livres", livresRoutes);

// 404 
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route non trouvée" });
});

// Gestionnaire d'erreurs global 
app.use(errorHandler);

module.exports = app;