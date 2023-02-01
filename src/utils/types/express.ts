import { IncomingMessage, ServerResponse } from 'node:http';

import { NextFunction, Request, Response } from 'express';

import { IInfra } from '@/interfaces/infra';

import { ApiException } from '../exception';

export { Router } from 'express';

export type ApiRequest = Request & { infra: IInfra };
export type ApiResponse = Response;
export type ApiNextFunction = NextFunction;

export type NextHandleFunction = (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void | Promise<void>;
export type NextErrorHandleFunction = (error: ApiException, req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

export type ControllerHandleFunction = (req: Request, res?: Response, next?: NextFunction) => void | Promise<void>;
