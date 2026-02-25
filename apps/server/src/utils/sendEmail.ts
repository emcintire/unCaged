import nodemailer, { type Transporter } from 'nodemailer';

import { getRequiredEnv } from './getRequiredEnv';
import { logger } from './logger';

type MailOptions = {
  to: string;
  subject: string;
  text: string;
};

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    const user = getRequiredEnv('EMAIL_USERNAME');
    const pass = getRequiredEnv('EMAIL_PASSWORD');
    const host = process.env.SMTP_HOST ?? 'smtp.zoho.com';
    const port = Number(process.env.SMTP_PORT ?? 465);
    const secure = (process.env.SMTP_SECURE ?? String(port === 465)) === 'true';

    transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }
  return transporter;
};

export const sendEmail = async (options: MailOptions): Promise<void> => {
  const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USERNAME;

  try {
    await getTransporter().sendMail({ from, ...options });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown mail error';
    logger.error('Failed to send email', { subject: options.subject, to: options.to, reason: message });
  }
};
