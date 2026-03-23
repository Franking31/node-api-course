const prisma = require("../db/prisma");
const { z } = require("zod");

const livreSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  auteur: z.string().min(1, "L'auteur est requis"),
  annee: z.number().int().optional(),
  genre: z.string().optional(),
});

async function getAll() {
  return prisma.livre.findMany({ orderBy: { createdAt: "desc" } });
}

async function getById(id) {
  const livre = await prisma.livre.findUnique({ where: { id } });
  if (!livre) {
    const err = new Error("Livre introuvable");
    err.status = 404;
    throw err;
  }
  return livre;
}

async function create(data) {
  const validated = livreSchema.parse(data);
  return prisma.livre.create({ data: validated });
}

async function update(id, data) {
  await getById(id);
  const validated = livreSchema.partial().parse(data);
  return prisma.livre.update({ where: { id }, data: validated });
}

async function remove(id) {
  await getById(id);
  return prisma.livre.delete({ where: { id } });
}

async function emprunter(livreId, userId) {
  const livre = await getById(livreId);

  if (!livre.disponible) {
    const err = new Error("Ce livre n'est pas disponible");
    err.status = 409;
    throw err;
  }

  const [emprunt] = await prisma.$transaction([
    prisma.emprunt.create({ data: { livreId, userId } }),
    prisma.livre.update({ where: { id: livreId }, data: { disponible: false } }),
  ]);

  return emprunt;
}

async function retourner(livreId, userId) {
  const emprunt = await prisma.emprunt.findFirst({
    where: { livreId, userId, dateRetour: null },
  });

  if (!emprunt) {
    const err = new Error("Aucun emprunt actif trouve pour ce livre");
    err.status = 404;
    throw err;
  }

  const [empruntMaj] = await prisma.$transaction([
    prisma.emprunt.update({
      where: { id: emprunt.id },
      data: { dateRetour: new Date() },
    }),
    prisma.livre.update({ where: { id: livreId }, data: { disponible: true } }),
  ]);

  return empruntMaj;
}

module.exports = { getAll, getById, create, update, remove, emprunter, retourner }; 