const express = require("express");
const router = express.Router();
const livresController = require("../controllers/livres.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

/**
 * @swagger
 * /api/livres:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags: [Livres]
 *     responses:
 *       200:
 *         description: Liste de tous les livres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       titre: { type: string }
 *                       auteur: { type: string }
 *                       annee: { type: integer }
 *                       genre: { type: string }
 *                       disponible: { type: boolean }
 */
router.get("/", livresController.getAll);

/**
 * @swagger
 * /api/livres/{id}:
 *   get:
 *     summary: Récupérer un livre par son ID
 *     tags: [Livres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du livre
 *     responses:
 *       200:
 *         description: Détails du livre
 *       404:
 *         description: Livre introuvable
 */
router.get("/:id", livresController.getById);

/**
 * @swagger
 * /api/livres:
 *   post:
 *     summary: Créer un nouveau livre (authentifié requis)
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, auteur]
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "la pluie sur l'armure"
 *               auteur:
 *                 type: string
 *                 example: "Pange Frank"
 *               annee:
 *                 type: integer
 *                 example: 2008
 *               genre:
 *                 type: string
 *                 example: "Poésie"
 *     responses:
 *       201:
 *         description: Livre créé avec succès
 *       401:
 *         description: Token manquant ou invalide
 */
router.post("/", authenticate, livresController.create);

/**
 * @swagger
 * /api/livres/{id}:
 *   put:
 *     summary: Modifier un livre (authentifié requis)
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre: { type: string }
 *               auteur: { type: string }
 *               annee: { type: integer }
 *               genre: { type: string }
 *     responses:
 *       200:
 *         description: Livre modifié
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Livre introuvable
 */
router.put("/:id", authenticate, livresController.update);

/**
 * @swagger
 * /api/livres/{id}:
 *   delete:
 *     summary: Supprimer un livre (admin uniquement)
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livre supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit — admin requis
 *       404:
 *         description: Livre introuvable
 */
router.delete("/:id", authenticate, authorize("admin"), livresController.remove);

router.post("/:id/emprunter", authenticate, livresController.emprunter);
router.post("/:id/retourner", authenticate, livresController.retourner);

module.exports = router;