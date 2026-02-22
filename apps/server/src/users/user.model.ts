import mongoose, { Schema, Document, Types } from 'mongoose';
import type { UserData } from './schemas/user.schema';

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
    default: '',
    required: false,
    minlength: 1,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  resetCode: {
    type: String,
    default: '',
    maxlength: 100,
  },
  resetCodeExpiry: {
    type: Date,
  },
  img: {
    type: String,
    default: '',
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
