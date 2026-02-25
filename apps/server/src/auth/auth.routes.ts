import express from 'express';

import { AuthController } from '@/auth';
import { createAuthLimiter } from '@/utils';

const fifteenMinutesInMs = 15 * 60 * 1000;
const loginLimiter = createAuthLimiter({ max: 10 });
const refreshLimiter = createAuthLimiter({ max: 60 });
const forgotPasswordLimiter = createAuthLimiter({ windowMs: fifteenMinutesInMs, max: 5 });
const checkCodeLimiter = createAuthLimiter({ windowMs: fifteenMinutesInMs, max: 8 });
const resetPasswordLimiter = createAuthLimiter({ windowMs: fifteenMinutesInMs, max: 5 });

export const authRouter = express.Router();
const controller = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthTokenData:
 *       type: object
 *       required: [accessToken, refreshToken]
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     operationId: login
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
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Auth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenData'
 *       '400':
 *         description: Invalid request
 */
authRouter.post('/login', loginLimiter, controller.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     operationId: logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully logged out
 */
authRouter.post('/logout', controller.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh token
 *     operationId: refresh
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully refreshed token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenData'
 */
authRouter.post('/refresh', refreshLimiter, controller.refresh);

/**
 * @swagger
 * /api/auth/forgotPassword:
 *   post:
 *     summary: Request password reset
 *     operationId: forgotPassword
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Reset token
 */
authRouter.post('/forgotPassword', forgotPasswordLimiter, controller.forgotPassword);

/**
 * @swagger
 * /api/auth/checkCode:
 *   post:
 *     summary: Check password reset code
 *     operationId: checkCode
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, email]
 *             properties:
 *               code:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Result message
 */
authRouter.post('/checkCode', checkCodeLimiter, controller.checkResetCode);

/**
 * @swagger
 * /api/auth/resetPassword:
 *   post:
 *     summary: Reset password
 *     operationId: resetPassword
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, email, newPassword]
 *             properties:
 *               code:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Result message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenData'
 */
authRouter.post('/resetPassword', resetPasswordLimiter, controller.resetPassword);