const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, email, password]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Frank Pange
 *               email:
 *                 type: string
 *                 format: email
 *                 example: frank@gmail.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Validation échouée
 *       409:
 *         description: Email déjà utilisé
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter et obtenir un access token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: frank@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Connexion réussie — access token retourné, refresh token dans le cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renouveler l'access token via le cookie refreshToken
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nouvel access token retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token manquant, invalide ou expiré
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion — révoque le refresh token et efface le cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnecté avec succès
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Token manquant ou invalide
 */
router.get("/me", authenticate, authController.me);

module.exports = router;