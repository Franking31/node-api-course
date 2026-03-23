require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth.routes");
const livresRoutes = require("./routes/livres.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/livres", livresRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route non trouvee" });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});