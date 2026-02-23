import type { ErrorInfo } from 'react';
import { env } from '@/config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogOptions = {
  level?: LogLevel;
  context?: string;
  data?: unknown;
};

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Only log in development or for errors
    return env.isDev || level === 'error';
  }

  private formatMessage(message: string, options?: LogOptions): string {
    const parts: Array<string> = [];
    
    if (options?.context) {
      parts.push(`[${options.context}]`);
    }
    
    parts.push(message);
    
    return parts.join(' ');
  }

  info(message: string, options?: Omit<LogOptions, 'level'>): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage(message, options));
      if (options?.data) {
        console.log('Data:', options.data);
      }
    }
  }

  warn(message: string, options?: Omit<LogOptions, 'level'>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message, options));
      if (options?.data) {
        console.warn('Data:', options.data);
      }
    }
  }

  error(message: string, error?: Error | unknown, info?: ErrorInfo | unknown, options?: Omit<LogOptions, 'level'>): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message, options));
      if (error instanceof Error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
      } else if (error) {
        console.error('Error:', error);
      }
      if (info) {
        console.error('Info:', info);
      }
      if (options?.data) {
        console.error('Data:', options.data);
      }
    }
  }

  debug(message: string, options?: Omit<LogOptions, 'level'>): void {
    if (env.isDev) {
      console.log(`[DEBUG] ${this.formatMessage(message, options)}`);
      if (options?.data) {
        console.log('Data:', options.data);
      }
    }
  }
}

export const logger = new Logger();
