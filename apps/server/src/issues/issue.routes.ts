import express from 'express';

import { admin, auth } from '@/middleware';

import { IssueController } from './issue.controller';

export const issueRouter = express.Router();
const controller = new IssueController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       required: [_id, userId, userEmail, type, title, description, status, createdOn]
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         userEmail:
 *           type: string
 *         userName:
 *           type: string
 *         type:
 *           type: string
 *           enum: [bug, feature, other]
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, resolved]
 *         createdOn:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/issues:
 *   post:
 *     summary: Submit an issue report
 *     operationId: submitIssue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, description]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bug, feature, other]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Issue submitted
 */
issueRouter.post('/', auth, controller.submitIssue);

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Get all issues (admin only)
 *     operationId: getIssues
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, resolved]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Paginated list of issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issues:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Issue'
 *                 total:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 */
issueRouter.get('/', auth, admin, controller.getIssues);

/**
 * @swagger
 * /api/issues/{id}/resolve:
 *   patch:
 *     summary: Mark an issue as resolved (admin only)
 *     operationId: resolveIssue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Updated issue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Issue'
 */
issueRouter.patch('/:id/resolve', auth, admin, controller.resolveIssue);

/**
 * @swagger
 * /api/issues/{id}:
 *   delete:
 *     summary: Delete an issue (admin only)
 *     operationId: deleteIssue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Issue deleted
 */
issueRouter.delete('/:id', auth, admin, controller.deleteIssue);
