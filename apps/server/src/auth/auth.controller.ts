import { AuthService } from 'auth/auth.service';
import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import type { LoginDto } from './schemas';

export class AuthController {
  private readonly authService = new AuthService();

  login = async (
    req: Request<unknown, unknown, LoginDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const tokenData = await this.authService.login(req.body);
      res.send(tokenData);
    } catch (error) {
      next(error);
    }
  };

  logout = async (
    req: AuthenticatedRequest<{ refreshToken: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.logout(req.body.refreshToken);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (
    req: Request<unknown, unknown, { refreshToken: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tokenData = await this.authService.refresh(req.body.refreshToken);
      res.send(tokenData);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request<unknown, unknown, { email: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.forgotPassword(req.body.email);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  checkResetCode = async (
    req: Request<unknown, unknown, { email: string; code: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.checkResetCode(req.body.email, req.body.code);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
  
  resetPassword = async (
    req: Request<unknown, unknown, { code: string; email: string; newPassword: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
}