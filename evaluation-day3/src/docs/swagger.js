// src/docs/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const { default: config } = require("../config/env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Bibliothèque",
      version: "1.0.0",
      description: "API REST sécurisée pour la gestion de la bibliothèque",
    },
    servers: [
      {
        url: `http://localhost:${config.PORT || 3000}`,
        description: "Serveur de développement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez votre Access Token JWT (obtenu après login)",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };