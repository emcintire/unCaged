import { AuthService } from 'auth/auth.service';
import { LoginDto } from 'auth/types';
import type { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/types';

const authService = new AuthService();

export class AuthController {
  async login(req: Request<unknown, unknown, LoginDto>, res: Response) {
    try {
      const tokenData = await authService.login(req.body);
      res.send(tokenData);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async logout(req: AuthenticatedRequest<{ refreshToken: string }>, res: Response) {
    try {
      await authService.logout(req.body.refreshToken);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async refresh(req: Request<unknown, unknown, { refreshToken: string }>, res: Response) {
    try {
      const tokenData = await authService.refresh(req.body.refreshToken);
      res.send(tokenData);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async forgotPassword(req: Request<unknown, unknown, { email: string }>, res: Response) {
    try {
      await authService.forgotPassword(req.body.email);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async checkResetCode(req: Request<unknown, unknown, { email: string; code: string }>, res: Response) {
    try {
      await authService.checkResetCode(req.body.email, req.body.code);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
  
  async resetPassword(req: Request<unknown, unknown, { code: string; email: string; newPassword: string; }>, res: Response) {
    try {
      await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}