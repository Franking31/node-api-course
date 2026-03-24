const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Créer un admin
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      nom: "Admin",
      email: "admin@gmail.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // Créer un user normal
  const userPassword = await bcrypt.hash("user1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      nom: "Utilisateur",
      email: "user@gmail.com",
      password: userPassword,
      role: "user",
    },
  });

  // Créer des livres
  const livres = [
    { titre: "Sous un ciel qui feint l'azur", auteur: "Frank Pange", annee: 2026, genre: "Poésie" },
    { titre: "The Pragmatic Programmer", auteur: "Hunt & Thomas", annee: 1999, genre: "Informatique" },
    { titre: "Node.js Design Patterns", auteur: "Mario Casciaro", annee: 2020, genre: "Informatique" },
    { titre: "Le Petit Prince", auteur: "Antoine de Saint-Exupery", annee: 1943, genre: "Roman" },
    { titre: "Valse de la couronne brisée", auteur: "Frank Pange", annee: 2026, genre: "Poésie" },
  ];

  for (const livre of livres) {
    await prisma.livre.create({ data: livre });
  }

  console.log("Seed termine :");
  console.log("  Admin : admin@library.com / admin1234");
  console.log("  User  : user@library.com / user1234");
  console.log(`  ${livres.length} livres crees`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

module.exports = main;