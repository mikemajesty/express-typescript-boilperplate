import { NextFunction, Request, Response } from 'express';
export { NextFunction, Request, Response } from 'express';

import { IInfra } from '@/interfaces/infra';

export { Router } from 'express';

export type ApiRequest = Request & { infra: IInfra };
export type ApiResponse = Response;
export type ApiNextFunction = NextFunction;
