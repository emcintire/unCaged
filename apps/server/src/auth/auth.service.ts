import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { User } from '@/users';
import {
  createRefreshTokenValue,
  getRequiredEnv,
  hashInput,
  hashRefreshToken,
  HttpError,
  logger,
  refreshExpiryDate,
  signAccessToken,
  validateSchema,
} from '@/utils';
import { RefreshToken } from './refreshToken.model';
import { type LoginDto, loginDtoSchema } from './schemas';

const getMailConfig = () => {
  const user = getRequiredEnv('EMAIL_USERNAME');
  const pass = getRequiredEnv('EMAIL_PASSWORD');

  const host = process.env.SMTP_HOST ?? 'smtp.zoho.com';
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = (process.env.SMTP_SECURE ?? String(port === 465)) === 'true';
  const from = process.env.EMAIL_FROM ?? user;

  return { user, pass, host, port, secure, from };
}

export class AuthService {
  async login(dto: LoginDto) {
    validateSchema(loginDtoSchema, dto);

    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const accessToken = signAccessToken({ sub: String(user._id), isAdmin: user.isAdmin });
    const refreshToken = createRefreshTokenValue();
    const refreshHash = hashRefreshToken(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshHash,
      expiresAt: refreshExpiryDate(),
      lastUsedAt: new Date(),
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      return;
    }

    const tokenHash = hashRefreshToken(refreshTokenValue);

    await RefreshToken.findOneAndUpdate(
      {
        tokenHash,
        revokedAt: { $exists: false },
      },
      {
        revokedAt: new Date(),
      }
    );
  }

  async refresh(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      throw new HttpError(400, 'Refresh token required', 'REFRESH_TOKEN_REQUIRED');
    }

    const incomingHash = hashRefreshToken(refreshTokenValue);

    const existing = await RefreshToken.findOne({
      tokenHash: incomingHash,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!existing) {
      throw new HttpError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(existing.userId);
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const newRefreshToken = createRefreshTokenValue();
    const newRefreshHash = hashRefreshToken(newRefreshToken);

    existing.revokedAt = new Date();
    existing.lastUsedAt = new Date();
    await existing.save();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newRefreshHash,
      expiresAt: refreshExpiryDate(),
      lastUsedAt: new Date(),
    });

    const accessToken = signAccessToken({
      sub: String(user._id),
      isAdmin: user.isAdmin,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      return;
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(randomNum, salt);

    user.resetCode = hashedCode;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const mailConfig = getMailConfig();

    const transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });

    const mailOptions = {
      from: mailConfig.from,
      to: email,
      subject: 'Forgot Password',
      text: `You are receiving this email because a password reset was requested for your unCaged account.

    Your password reset code is: ${randomNum}

    This code will expire in 15 minutes.
    If you did not request a password reset, you can safely ignore this email.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown mail error';
      logger.error('Failed to send password reset email', {
        userId: user._id.toString(),
        email,
        reason: message,
      });
    }
  }

  async checkResetCode(email: string, code: string) {
    const user = await User.findOne({ email });
    if (!user || !user.resetCode) {
      throw new HttpError(400, 'Invalid Code', 'INVALID_RESET_CODE');
    }

    if (user.resetCodeExpiry && user.resetCodeExpiry < new Date()) {
      throw new HttpError(400, 'Reset code has expired', 'EXPIRED_RESET_CODE');
    }

    const validCode = await bcrypt.compare(code, user.resetCode);
    if (!validCode) {
      throw new HttpError(400, 'Invalid Code', 'INVALID_RESET_CODE');
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await User.findOne({ email });
    if (!user || !user.resetCode) {
      throw new HttpError(400, 'Invalid Code', 'INVALID_RESET_CODE');
    }

    if (user.resetCodeExpiry && user.resetCodeExpiry < new Date()) {
      throw new HttpError(400, 'Reset code has expired', 'EXPIRED_RESET_CODE');
    }

    const validCode = await bcrypt.compare(code, user.resetCode);
    if (!validCode) {
      throw new HttpError(400, 'Invalid Code', 'INVALID_RESET_CODE');
    }

    const hashedPassword = await hashInput(newPassword);
    user.password = hashedPassword;
    user.resetCode = '';
    user.resetCodeExpiry = undefined;
    await user.save();
  }
}