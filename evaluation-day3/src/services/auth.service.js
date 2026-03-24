const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../db/prisma");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { default: config } = require("../config/env");

//Helpers tokens 

function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || "15m", // ≤ 15 min
  });
}

async function generateRefreshToken(userId) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

//Services 

async function register(data) {
  const { nom, email, password } = registerSchema.parse(data);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Cet email est déjà utilisé");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { nom, email, password: hashedPassword },
    select: { id: true, nom: true, email: true, role: true, createdAt: true },
  });

  return { user };
}

async function login(data) {
  const { email, password } = loginSchema.parse(data);

  const user = await prisma.user.findUnique({ where: { email } });
  const isValid = user && (await bcrypt.compare(password, user.password));

  // Même message pour email inconnu ET mauvais mot de passe (anti-énumération)
  if (!isValid) {
    const err = new Error("Email ou mot de passe incorrect");
    err.status = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, accessToken, refreshToken };
}

async function refresh(token) {
  if (!token) {
    const err = new Error("Refresh token manquant");
    err.status = 401;
    throw err;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error("Refresh token invalide ou expiré");
    err.status = 401;
    throw err;
  }

  const accessToken = generateAccessToken(stored.userId);
  return { accessToken };
}

async function logout(token) {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
}

module.exports = { register, login, refresh, logout };