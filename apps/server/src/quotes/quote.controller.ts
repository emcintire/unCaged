import type { NextFunction, Request, Response } from 'express';
import { QuoteService } from './quote.service';
import type { CreateQuoteDto } from './schemas';

export class QuoteController {
  private readonly quoteService = new QuoteService();

  getQuote = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const quote = await this.quoteService.getQuote();
      res.status(200).send(quote);
    } catch (error) {
      next(error);
    }
  };

  createQuote = async (
    req: Request<unknown, unknown, CreateQuoteDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const quote = await this.quoteService.createQuote(req.body);
      res.status(201).send(quote);
    } catch (error) {
      next(error);
    }
  };
}
