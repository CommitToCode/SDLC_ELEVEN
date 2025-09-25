const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Car & Bike Rental App API",
      version: "1.0.0",
      description:
        "Car & Bike Rental App API documentation created by Somnath Senapati & Rishi Banerjee",
      contact: {
        name: "Somnath Senapati & Rishi Banerjee",
      },
    },
    servers: [
      {
        url: "https://sdlc-eleven.onrender.com",
      },
      {
        url: "http://localhost:2809",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "User authentication and account management",
      },
    ],
  },
  apis: ["./app.js", "./app/routes/api/*.js"], 
};


const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
