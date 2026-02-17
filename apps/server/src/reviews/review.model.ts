import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ReviewData } from './review.schema';

export type ReviewDocument = ReviewData & Document & {
  _id: Types.ObjectId;
};

const reviewMongooseSchema = new Schema<ReviewDocument>({
  userId: {
    type: String,
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 2048,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  isSpoiler: {
    type: Boolean,
    default: false,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

export const Review = mongoose.model<ReviewDocument>('Review', reviewMongooseSchema);
