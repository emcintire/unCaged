import type { Request, Response } from 'express';
import { QuoteService } from './quote.service';
import type { CreateQuoteDto } from './types';

const quoteService = new QuoteService();

export class QuoteController {
  async getQuote(_req: Request, res: Response) {
    try {
      const quote = await quoteService.getQuote();
      res.status(200).send(quote);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async createQuote(req: Request<unknown, unknown, CreateQuoteDto>, res: Response) {
    try {
      const quote = await quoteService.createQuote(req.body);
      res.status(200).send(quote);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
