import type { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { ValidationError } from '../../application/errors.js';

type RequestSection = 'body' | 'query' | 'params';

type MutableRequest = Request & {
  [key: string]: unknown;
};

export const validate = <T extends ZodTypeAny>(schema: T, section: RequestSection = 'body') => (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  const result = schema.safeParse(request[section]);

  if (!result.success) {
    next(
      new ValidationError('Request validation failed', {
        issues: result.error.flatten(),
      }),
    );
    return;
  }

  (request as MutableRequest)[section] = result.data;
  next();
};
