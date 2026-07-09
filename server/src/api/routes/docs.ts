import { Router } from 'express';
import { openApiSpec } from '../openapi/spec.js';

export const createDocsRouter = (): Router => {
  const router = Router();

  router.get('/', (_request, response) => {
    response.json(openApiSpec);
  });

  return router;
};
