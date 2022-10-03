import { HttpStatus } from './status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Response = any;

export class ApiException extends Error {
  readonly config?: unknown;
  readonly code?: string;
  statusCode: number | undefined;

  constructor(error: Response, status?: HttpStatus, private readonly context?: string) {
    const err = [error?.message, error].find(Boolean);
    super(err);
    this.message = err;
    this.name = ApiException.name;
    this.statusCode = [status, Number(this.code), HttpStatus.INTERNAL_SERVER_ERROR].find(Boolean);

    if (this.context) {
      this.context = this.context;
    }
  }
}
