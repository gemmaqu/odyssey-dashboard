import type { ErrorResponse } from '../schemas/common.js';

export type ErrorDetail = { path: string; message: string };

/**
 * A typed, HTTP-aware application error. Services throw these; a single
 * `app.onError` handler turns them into the standard error envelope.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }

  toResponse(): ErrorResponse {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }
}

export const notFound = (message: string) => new AppError(404, 'not_found', message);
export const badRequest = (message: string, details?: ErrorDetail[]) =>
  new AppError(400, 'validation_error', message, details);
/** 409 — request understood but conflicts with current state (e.g. illegal transition). */
export const conflict = (message: string) => new AppError(409, 'conflict', message);
/** 422 — a referenced menu item is unavailable / cannot be ordered. */
export const unprocessable = (message: string, details?: ErrorDetail[]) =>
  new AppError(422, 'unprocessable', message, details);
