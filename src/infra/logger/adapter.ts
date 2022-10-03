import { HttpLogger } from 'pino-http';
import { LoggerService } from './service';
import { ErrorType, LogLevel, MessageType } from './types';

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
