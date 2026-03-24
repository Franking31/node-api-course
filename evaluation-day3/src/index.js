require("dotenv").config();
const { default: config } = require("./config/env");
const app = require("./app");
const prisma = require("./db/prisma");   // ← ligne manquante
const seed = require("./db/seed");

const PORT = config.PORT || 3000;

async function startServer() {
  try {
    if (config.NODE_ENV !== "production") {
      const existingUser = await prisma.user.findFirst();
      if (!existingUser) {
        console.log("Lancement du seeding...");
        await seed();
        console.log("Seeding terminé");
      } else {
        console.log("Seed déjà effectué, skip.");
      }
    }

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
      console.log(`Swagger : http://localhost:${PORT}/api-docs`);
      console.log(`Admin par défaut → admin@livres.com / admin123`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage :", error);
    process.exit(1);
  }
}

startServer();