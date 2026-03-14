import { User } from '@/users';
import { HttpError, sendEmail, validateSchema } from '@/utils';

import { Issue } from './issue.model';
import { type IssueData,issueSchema } from './issue.schema';

type SubmitIssueParams = IssueData & { userId: string };

export class IssueService {
  async submitIssue({ userId, ...dto }: SubmitIssueParams) {
    validateSchema(issueSchema, dto);

    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, 'User not found.', 'USER_NOT_FOUND');

    const issue = new Issue({
      userId,
      userEmail: user.email,
      userName: user.name ?? '',
      ...dto,
    });
    await issue.save();

    const adminEmail = process.env.EMAIL_USERNAME;
    if (adminEmail) {
      const typeLabel = dto.type === 'bug' ? 'Bug Report' : dto.type === 'feature' ? 'Feature Request' : 'Other';
      void sendEmail({
        to: adminEmail,
        subject: `[unCaged] New Issue: ${dto.title}`,
        text: [
          `Type: ${typeLabel}`,
          `From: ${user.name ?? 'Unknown'} (${user.email})`,
          '',
          dto.description,
        ].join('\n'),
      });
    }

    return issue;
  }

  async getIssues({ status, page = 1 }: { status?: 'open' | 'resolved'; page?: number }) {
    const limit = 20;
    const filter = status ? { status } : {};
    const [issues, total] = await Promise.all([
      Issue.find(filter).sort({ createdOn: -1 }).skip((page - 1) * limit).limit(limit),
      Issue.countDocuments(filter),
    ]);
    return { issues, total, hasMore: page * limit < total };
  }

  async resolveIssue(id: string) {
    const issue = await Issue.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    if (!issue) throw new HttpError(404, 'Issue not found.', 'ISSUE_NOT_FOUND');
    return issue;
  }

  async deleteIssue(id: string) {
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) throw new HttpError(404, 'Issue not found.', 'ISSUE_NOT_FOUND');
  }
}
