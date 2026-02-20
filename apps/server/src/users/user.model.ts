import mongoose, { Schema, Document, Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import type { UserData } from './schemas/user.schema';

type UserMethods = {
  generateAuthToken(): string;
};

export type UserDocument = Document & UserData & UserMethods & {
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

userSchema.methods.generateAuthToken = function (): string {
  const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
  if (!jwtPrivateKey) {
    throw new Error('JWT_PRIVATE_KEY is not defined');
  }
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    jwtPrivateKey
  );
};

export const User = mongoose.model<UserDocument>('User', userSchema);
