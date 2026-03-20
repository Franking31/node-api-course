const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const { z } = require("zod");

const registerSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function register(data) {
  const validated = registerSchema.parse(data);

  const existing = await prisma.user.findUnique({ where: { email: validated.email } });
  if (existing) {
    const err = new Error("Cet email est deja utilise");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10);
  const user = await prisma.user.create({
    data: { nom: validated.nom, email: validated.email, password: hashedPassword },
    select: { id: true, nom: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken(user.id);
  return { user, token };
}

async function login(data) {
  const validated = loginSchema.parse(data);

  const user = await prisma.user.findUnique({ where: { email: validated.email } });
  const isValid = user && (await bcrypt.compare(validated.password, user.password));

  if (!isValid) {
    const err = new Error("Email ou mot de passe incorrect");
    err.status = 401;
    throw err;
  }

  const { password, ...userWithoutPassword } = user;
  const token = generateToken(user.id);
  return { user: userWithoutPassword, token };
}

module.exports = { register, login };