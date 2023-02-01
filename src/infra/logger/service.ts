/* eslint-disable @typescript-eslint/no-explicit-any */
import { IncomingMessage, ServerResponse } from 'node:http';
import { exit } from 'node:process';

import { green, greenBright, isColorSupported, red, yellow } from 'colorette';
import { PinoRequestConverter } from 'convert-pino-request-to-curl';
import { DateTime } from 'luxon';
import { LevelWithSilent, Logger, multistream, pino } from 'pino';
import { HttpLogger, Options, pinoHttp, ReqId } from 'pino-http';
import pinoPretty from 'pino-pretty';
import { v4 as uuidv4 } from 'uuid';

import { name } from '../../../package.json';
import { ApiException } from '../../utils/exception/service';
import { ILoggerAdapter } from './adapter';
import { MessageType } from './types';

export class LoggerService implements ILoggerAdapter<HttpLogger> {
  httpLogger!: HttpLogger;
  private app: string = name;

  constructor(logLevel?: LevelWithSilent) {
    const pinoLogger = pino(
      {
        useLevelLabels: true,
        level: logLevel || 'trace',
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

  log(message: string): void {
    this.httpLogger.logger.trace(green(message));
  }

  trace({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.httpLogger.logger.trace([obj, greenBright(message)].find(Boolean), greenBright(message));
  }

  info({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.httpLogger.logger.info([obj, green(message)].find(Boolean), green(message));
  }

  warn({ message, context, obj = {} }: MessageType): void {
    Object.assign(obj, { context });
    this.httpLogger.logger.warn([obj, yellow(message)].find(Boolean), yellow(message));
  }

  error(error: any, message?: string, context?: string): void {
    const errorResponse = this.getErrorResponse(error);

    const response = error?.name === ApiException.name ? { statusCode: error['statusCode'], message: error?.message } : errorResponse?.value();

    const type = {
      Error: ApiException.name,
    }[String(error?.name)];

    this.httpLogger.logger.error(
      {
        ...response,
        context: [context, this.app].find(Boolean),
        type: [type, error?.name].find(Boolean),
        traceid: this.getTraceId(error),
        timestamp: this.getDateFormat(),
        application: this.app,
        stack: error.stack,
      },
      red(String([message, error?.message, error].find(Boolean))),
    );
  }

  fatal(error: any, message?: string, context?: string): void {
    this.httpLogger.logger.fatal(
      {
        ...(error.getResponse() as object),
        context: [context, this.app].find(Boolean),
        type: error.name,
        traceid: this.getTraceId(error),
        timestamp: this.getDateFormat(),
        application: this.app,
        stack: error.stack,
      },
      red(String([message, error?.message, error].find(Boolean))),
    );
    exit(1);
  }

  getPinoConfig() {
    return {
      colorize: isColorSupported,
      levelFirst: true,
      ignore: 'pid,hostname',
      quietReqLogger: true,
      messageFormat: (log: any, messageKey: string) => {
        const message = log[String(messageKey)];
        if (this.app) {
          return `[${this.app}] ${message}`;
        }

        return message;
      },
      customPrettifiers: {
        time: () => {
          return `[${this.getDateFormat()}]`;
        },
      },
    };
  }

  getPinoHttpConfig(pinoLogger?: Logger): Options {
    return {
      logger: pinoLogger,
      quietReqLogger: true,
      customSuccessMessage: (_req: IncomingMessage, res: ServerResponse) => {
        return `request ${res.statusCode >= 400 ? red('errro') : green('success')} with status code: ${res.statusCode}`;
      },
      customErrorMessage: (_req: IncomingMessage, res: ServerResponse, error: Error) => {
        return `request ${red(error.name)} with status code: ${res.statusCode} `;
      },
      genReqId: (req: any): ReqId => {
        req['id'] = req.headers['traceid'];
        return req.id;
      },
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
        responseTime: 'timeTaken',
        reqId: 'traceid',
      },
      serializers: {
        err: () => {
          return;
        },
        req: (request: any) => {
          return {
            method: request.method,
            curl: PinoRequestConverter.getCurl(request),
          };
        },
        res: pino.stdSerializers.res,
      },
      customProps: (req: any): object => {
        const context = req.context;

        const traceid = [req?.headers?.traceid, req.id].find(Boolean);

        const path = `${req.protocol}://${req.headers.host}${req.url}`;

        const info = {
          traceid,
          context: context,
          path,
          timestamp: this.getDateFormat(),
        };

        this.httpLogger.logger.setBindings(info);

        return this.httpLogger.logger.bindings();
      },
      customLogLevel: (_req: IncomingMessage, res: ServerResponse, error: Error): pino.LevelWithSilent => {
        if ([error, res?.statusCode >= 400].some(Boolean)) {
          return 'error';
        }

        if ([res.statusCode >= 300, res.statusCode <= 400].every(Boolean)) {
          return 'silent';
        }

        return 'info';
      },
    };
  }

  private getErrorResponse(error: any): any {
    const isFunction = typeof error?.getResponse === 'function';
    return [
      {
        conditional: isFunction && typeof error.getResponse() === 'string',
        value: () => {
          const err = new ApiException(error.getResponse(), [error.getStatus(), error['status']].find(Boolean), error['context']);
          return {
            statusCode: [err?.statusCode, err?.code, 500].find(Boolean),
            message: [err?.message, err].find(Boolean),
          };
        },
      },
      {
        conditional: isFunction && typeof error.getResponse() === 'object',
        value: () => error?.getResponse(),
      },
    ].find(c => c.conditional);
  }

  private getDateFormat(date = new Date(), format = 'dd-MM-yyyy HH:mm:ss'): string {
    return DateTime.fromJSDate(date).setZone(process.env.TZ).toFormat(format);
  }

  private getTraceId(error: any): string {
    if (typeof error === 'string') return uuidv4();
    return [error.traceid, this.httpLogger.logger.bindings()['tranceId']].find(Boolean);
  }
}
