const { default: config } = require("../config/env");
const authService = require("../services/auth.service");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function register(req, res, next) {
  try {
    const { nom, email, password } = req.body; 
    const result = await authService.register({ nom, email, password });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body; 
    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    // Refresh token en cookie HttpOnly
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.status(200).json({ success: true, user, accessToken });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    const result = await authService.refresh(token);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    await authService.logout(token);

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ success: true, message: "Déconnecté avec succès" });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  const { password, ...user } = req.user;
  res.json({ success: true, data: user });
}

module.exports = { register, login, refresh, logout, me };