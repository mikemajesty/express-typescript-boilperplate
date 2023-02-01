import { HttpLogger } from 'pino-http';

import { ErrorType, MessageType } from './types';

export interface ILoggerAdapter<T extends HttpLogger = HttpLogger> {
  httpLogger: T;
  setApplication(app: string): void;
  error(error: ErrorType, message?: string, context?: string): void;
  fatal(error: ErrorType, message?: string, context?: string): void;
  trace({ message, context, obj }: MessageType): void;
  info({ message, context, obj }: MessageType): void;
  warn({ message, context, obj }: MessageType): void;
  getPinoHttpConfig(pinoLogger: unknown): unknown;
  getPinoConfig(): unknown;
}

// Logger.trace(): tracerId: string
// Logger.setup({ app: string })
// Logger.info(message: string, data?: any)
// Logger.error(error: Error)
