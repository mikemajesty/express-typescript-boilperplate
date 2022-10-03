import { gray, green, red, yellow } from 'colorette';
import { DateTime } from 'luxon';
import { ServerResponse } from 'node:http';
import { LevelWithSilent, Logger, pino, multistream } from 'pino';
import { HttpLogger, pinoHttp } from 'pino-http';
import pinoPretty from 'pino-pretty';
import { v4 as uuidv4 } from 'uuid';

import { name } from '../../../package.json';
import { ApiException } from '../../libs/exception/service';

import { ILoggerAdapter } from './adapter';

import { ErrorType, MessageType } from './types';

export class LoggerService implements ILoggerAdapter<HttpLogger> {
  httpLogger!: HttpLogger;
  private context!: string;
  private app!: string;

  constructor(logLevel?: LevelWithSilent) {
    this.setApplication(name);

    const pinoLogger = pino(
      {
        useLevelLabels: true,
        level: [logLevel, 'trace'].find(Boolean),
      },
      multistream([
        {
          level: 'trace',
          stream: pinoPretty(this.getPinoConfig()),
        },
      ]),
    );

    this.httpLogger = pinoHttp(this.getPinoHttpConfig(pinoLogger));
  }

  setApplication(app: string): void {
    this.app = app;
  }

  trace({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.httpLogger.logger.trace([obj, gray(message)].find(Boolean), gray(message));
  }

  warn({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.httpLogger.logger.warn([obj, yellow(message)].find(Boolean), yellow(message));
  }

  info({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.httpLogger.logger.info([obj, green(message)].find(Boolean), green(message));
  }

  error(error: ErrorType, message?: string, context?: string): void {
    const response = this.getErrorResponse(error);
    const model = {
      ...(response || error),
      context: [context, this.context, error['context']].find(Boolean),
      type: error?.name || Error.name,
      traceId: this.getTraceId(error),
      timestamp: this.getDateFormat(),
      application: this.app,
      trace: error.stack?.replace(/\n/g, '')?.replace('/', ''),
    };
    this.httpLogger.logger.error(model, red(error?.message || message));
  }

  fatal(error: ApiException, message?: string, context?: string): void {
    const model = {
      ...error,
      context: context || this.context,
      type: error.name,
      traceId: this.getTraceId(error),
      timestamp: this.getDateFormat(),
      application: this.app,
      trace: error?.stack?.replace(/\n/g, '').replace('/', ''),
    };

    this.httpLogger.logger.fatal(model, red(message || error.message));
  }

  getPinoConfig() {
    return {
      colorize: true,
      levelFirst: true,
      ignore: 'pid,hostname',
      quietReqLogger: true,
      messageFormat: (log: any, messageKey: string) => {
        const message = log[String(messageKey)];
        const context = [this.context, this.app]?.find((c: string) => c);
        if (context) return `[${context}] ${message}`;

        return `${message}`;
      },
      customPrettifiers: {
        time: () => {
          return `[${this.getDateFormat()}]`;
        },
      },
    };
  }

  getPinoHttpConfig(pinoLogger: Logger): any {
    return {
      logger: pinoLogger,
      quietReqLogger: true,
      customSuccessMessage: (res: any) => {
        return `request ${res.statusCode >= 400 ? red('errro') : green('success')} with status code: ${res.statusCode}`;
      },
      customErrorMessage: function (error: Error | ApiException, res: ServerResponse) {
        return `request ${red(error.name.toLowerCase())} with status code: ${res.statusCode} `;
      },
      genReqId: (req: any) => {
        return req.event.headers.traceId;
      },
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'timeTaken',
        reqId: 'traceId',
      },
      serializers: {
        err: (err: any) => pino.stdSerializers.err(err),
        req: (req: any) => {
          return req;
        },
        res: pino.stdSerializers.res,
      },
      customProps: (req: any): unknown => {
        const context = this.context || req.context.functionName;
        req.ctx = context;
        const traceId = req.event?.headers?.traceId || req.id;

        const path = req.event?.requestContext
          ? `${req.event.headers.Host}${req.event.requestContext.resourcePath}`
          : 'invoke';

        this.httpLogger.logger.setBindings({
          traceId,
          application: this.app,
          context: context,
          path,
          timestamp: this.getDateFormat(),
        });

        return {
          traceId,
          application: this.app,
          context: context,
          path,
          timestamp: this.getDateFormat(),
        };
      },
      customLogLevel: (res: any, err: any) => {
        if ([res.statusCode >= 400, err].some(Boolean)) {
          return 'error';
        }

        if ([res.statusCode >= 300, res.statusCode <= 400].every(Boolean)) {
          return 'silent';
        }

        return 'info';
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getErrorResponse(error: any) {
    if (error?.name === ApiException.name) {
      return { statusCode: error['statusCode'], message: error?.message };
    }

    const isFunction = typeof error?.getResponse === 'function';

    const errorResponse = [
      {
        conditional: isFunction && typeof error.getResponse() === 'string',
        value: () =>
          { const exception  = new ApiException(error.getResponse(), error.getStatus() || error['status'], error['context']) 
          return {
            statusCode: exception.statusCode,
            message: exception.message 
          }
        },
      },
      {
        conditional: isFunction && typeof error.getResponse() === 'object',
        value: () => error?.getResponse(),
      },
    ].find((c) => c.conditional);

    return errorResponse?.value();
  }

  private getDateFormat(date = new Date()): string {
    return DateTime.fromJSDate(date).setZone(process.env.TZ).toFormat('yyyy-MM-dd HH:mm:ss');
  }

  private getTraceId(err: any): string {
    if (typeof err === 'string') return uuidv4();
    return [err.traceId, this.httpLogger.logger.bindings()?.tranceId].find(Boolean);
  }
}
