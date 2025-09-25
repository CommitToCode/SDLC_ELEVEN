const express = require("express");
const { getProfile, updateProfile } = require("../../controllers/api/userController");
const { AuthCheck } = require("../../middleware/auth");
const upload = require("../../middleware/upload");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management for Car & Bike Rental
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", AuthCheck, getProfile);

/**
 * @swagger
 * /api/user/me:
 *   put:
 *     summary: Update logged-in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Name
 *               licenseNumber:
 *                 type: string
 *                 example: "OD9876543210"
 *               licenseFile:
 *                 type: string
 *                 format: binary
 *                 description: Upload new license file
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/me", AuthCheck, upload.single("licenseFile"), updateProfile);

module.exports = router;
