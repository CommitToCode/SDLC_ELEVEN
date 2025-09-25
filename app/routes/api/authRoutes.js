const express = require("express");
const upload = require("../../middleware/upload");

const {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} = require("../../controllers/api/authController");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user with email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Somnath Senapati
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Passw0rd@
 *               licenseNumber:
 *                 type: string
 *                 example: DL-123456789
 *               licenseFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

router.post("/signup", upload.single("licenseFile"), signup);


/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify email with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 */
router.post("/verify", verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *               password:
 *                 type: string
 *                 example: Passw0rd@
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassw0rd@
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 */
router.post("/reset-password", resetPassword);

module.exports = router;
