import mongoose, { Schema, Document, Types } from 'mongoose';
import { DEFAULT_USER_IMG } from '@/utils';
import type { UserData } from './user.schema';

export type UserDocument = Document & UserData & {
  _id: Types.ObjectId;
};

const userSchema = new Schema<UserDocument>({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
  name: {
    type: String,
    required: false,
    maxLength: 100,
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    maxLength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxLength: 1024,
  },
  resetCode: {
    type: String,
    maxLength: 100,
  },
  resetCodeExpiry: {
    type: Date,
    maxLength: 100,
  },
  img: {
    type: String,
    default: DEFAULT_USER_IMG,
    maxLength: 100,
  },
  ratings: [
    {
      movie: String,
      rating: Number,
    },
  ],
  watchlist: [String],
  favorites: [String],
  seen: [String],
});

export const User = mongoose.model<UserDocument>('User', userSchema);
