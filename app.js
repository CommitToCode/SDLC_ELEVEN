require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const SwaggerOptions = require("./swagger.json");
const path = require("path");
const dbCon = require("./app/config/db");

const app = express();

// Connect to DB
dbCon();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:2809", "https://car-bike-rental.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // in case form-data JSON fields
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./app/routes/api/authRoutes"));
app.use("/api/user", require("./app/routes/api/userRoutes"));
app.use("/api/users", require("./app/routes/api/userRoutes"));
app.use("/api/vehicles", require("./app/routes/api/vehicleApiRoute"));

// Swagger
const swaggerDocument = swaggerJsDoc(SwaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
const port = process.env.PORT || 2809;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
