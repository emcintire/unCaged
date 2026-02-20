import mongoose, { Schema, Document, Types } from 'mongoose';
import type { QuoteData } from './schemas/quote.schema';

export type QuoteDocument = QuoteData & Document & {
  _id: Types.ObjectId;
};

const quoteMongooseSchema = new Schema<QuoteDocument>({
  quote: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  subquote: {
    type: String,
    required: false,
    minlength: 1,
    maxlength: 128,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

export const Quote = mongoose.model<QuoteDocument>('Quote', quoteMongooseSchema);
