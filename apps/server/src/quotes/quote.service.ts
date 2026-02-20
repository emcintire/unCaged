import { Quote } from './quote.model';
import { quoteSchema } from './quote.schema';
import { quotes } from '@/util';
import type { CreateQuoteDto } from './types';

export class QuoteService {
  async getQuote() {
    const quote = await Quote.findOne({
      createdOn: {
        $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000),
      },
    })
      .sort({ createdOn: -1 });

    if (quote) return quote;

    const oneWeek = 24 * 60 * 60 * 1000 * 7;
    const firstDate = new Date(2021, 10, 14);
    const secondDate = new Date();
    const diffWeek = Math.floor(
      Math.abs((firstDate.getTime() - secondDate.getTime()) / oneWeek)
    );

    const index = diffWeek % quotes.length;
    return quotes[index];
  }

  async createQuote(dto: CreateQuoteDto) {
    const validation = quoteSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const quote = new Quote({
      quote: dto.quote,
      subquote: dto.subquote,
    });

    await quote.save();
    return quote;
  }
}
