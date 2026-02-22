import mongoose, { Schema, Types } from 'mongoose';

export type RefreshTokenDocument = mongoose.Document & {
  userId: Types.ObjectId;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date;
  revokedAt?: Date;
};

const refreshTokenSchema = new Schema<RefreshTokenDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date, required: true },
  lastUsedAt: { type: Date, default: () => new Date() },
  revokedAt: { type: Date },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<RefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema
);