import mongoose, { Document, Schema, Types } from 'mongoose';

import type { IssueData } from './issue.schema';

export type IssueDocument = IssueData &
  Document & {
    _id: Types.ObjectId;
    userId: string;
    userEmail: string;
    userName: string;
    status: 'open' | 'resolved';
    createdOn: Date;
  };

const issueMongooseSchema = new Schema<IssueDocument>({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, default: '' },
  type: { type: String, enum: ['bug', 'feature', 'other'], required: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2048 },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdOn: { type: Date, default: () => new Date() },
});

export const Issue = mongoose.model<IssueDocument>('Issue', issueMongooseSchema);
