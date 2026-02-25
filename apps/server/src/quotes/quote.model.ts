import mongoose, { Document, Schema, Types } from 'mongoose';

import type { QuoteData } from './quote.schema';

export type QuoteDocument = QuoteData & Document & {
  _id: Types.ObjectId;
};

const quoteMongooseSchema = new Schema<QuoteDocument>({
  quote: {
    type: String,
    required: true,
    minlength: 1,
    maxLength: 255,
  },
  subquote: {
    type: String,
    required: true,
    minlength: 1,
    maxLength: 255,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

export const Quote = mongoose.model<QuoteDocument>('Quote', quoteMongooseSchema);
