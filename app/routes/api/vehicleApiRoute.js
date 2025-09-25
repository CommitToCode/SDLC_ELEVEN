const express = require("express");
const router = express.Router();
const vehicleController = require("../../controllers/api/vehicleApiController");

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: API for managing vehicles
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of all vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f6a2b1e1f2c1a23b456789
 *                   model:
 *                     type: string
 *                     example: Toyota Corolla
 *                   type:
 *                     type: string
 *                     example: car
 *                   isAvailable:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Server error
 */
router.get("/", vehicleController.getAllVehicles);

/**
 * @swagger
 * /api/vehicles/available:
 *   get:
 *     summary: Get all available vehicles
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of available vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64f6a2b1e1f2c1a23b456789
 *                   model:
 *                     type: string
 *                     example: Honda Civic
 *                   type:
 *                     type: string
 *                     example: car
 *                   isAvailable:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Server error
 */
router.get("/available", vehicleController.getAvailableVehicles);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const vehicleController = require("../../controllers/api/vehicleApiController");

// router.post("/", vehicleController.addVehicle);
// router.get("/", vehicleController.getAllVehicles);
// router.get("/available", vehicleController.getAvailableVehicles);
// router.get("/:id", vehicleController.getVehicleById);
// router.put("/:id", vehicleController.updateVehicle);
// router.delete("/:id", vehicleController.deleteVehicle);

// module.exports = router;
