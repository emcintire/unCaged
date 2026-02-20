import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ReviewData } from './schemas/review.schema';

export type ReviewDocument = ReviewData & Document & {
  _id: Types.ObjectId;
  likes: string[];
  isFlagged: boolean;
  flaggedBy: string[];
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
  likes: {
    type: [String],
    default: [],
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flaggedBy: {
    type: [String],
    default: [],
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

export const Review = mongoose.model<ReviewDocument>('Review', reviewMongooseSchema);
