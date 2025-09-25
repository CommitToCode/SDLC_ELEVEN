const express = require("express");
const {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
} = require("../../controllers/api/authController");
const upload = require("../../middleware/upload");

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
 *             required:
 *               - name
 *               - email
 *               - password
 *               - licenseNumber
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
 *                 description: Upload license image (jpg, png, pdf, optional)
 *     responses:
 *       "201":
 *         description: User registered successfully
 *       "400":
 *         description: Validation error or invalid file
 *       "500":
 *         description: Server error
 */
// Multer error handling wrapper to prevent Swagger UI hang
router.post(
  "/signup",
  (req, res, next) => {
    upload.single("licenseFile")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: false, message: err.message });
      }
      next();
    });
  },
  signup
);

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
 *             required:
 *               - email
 *               - otp
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
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
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
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Passw0rd@
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
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
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent for password reset
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: somnath@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewPassw0rd@
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/reset-password", resetPassword);

module.exports = router;
