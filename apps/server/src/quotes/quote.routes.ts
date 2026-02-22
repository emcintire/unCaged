import express from 'express';
import { auth, admin } from '@/middleware';
import { QuoteController } from './quote.controller';

export const quoteRouter = express.Router();
const controller = new QuoteController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Quote:
 *       type: object
 *       required: [quote, subquote]
 *       properties:
 *         quote:
 *           type: string
 *         subquote:
 *           type: string
 */

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Get a random quote
 *     operationId: getQuote
 *     tags: [Quotes]
 *     responses:
 *       '200':
 *         description: A quote or array of quotes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *   post:
 *     summary: Create a quote (admin only)
 *     operationId: addQuote
 *     tags: [Quotes]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quote, subquote]
 *             properties:
 *               quote:
 *                 type: string
 *               subquote:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created quote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 */
quoteRouter.get('/', controller.getQuote);
quoteRouter.post('/', auth, admin, controller.createQuote);
