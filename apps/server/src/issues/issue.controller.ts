import type { NextFunction, Response } from 'express';

import type { AuthenticatedRequest } from '@/types';

import type { IssueData } from './issue.schema';
import { IssueService } from './issue.service';

export class IssueController {
  private readonly issueService = new IssueService();

  submitIssue = async (
    req: AuthenticatedRequest<IssueData>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.issueService.submitIssue({ userId: req.user!.sub, ...req.body });
      res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  };

  getIssues = async (
    req: AuthenticatedRequest<never, never, { status?: 'open' | 'resolved'; page?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { status, page } = req.query;
      const result = await this.issueService.getIssues({ status, page: Number(page ?? 1) });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resolveIssue = async (
    req: AuthenticatedRequest<never, { id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const issue = await this.issueService.resolveIssue(req.params.id);
      res.status(200).json(issue);
    } catch (error) {
      next(error);
    }
  };

  deleteIssue = async (
    req: AuthenticatedRequest<never, { id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.issueService.deleteIssue(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}
