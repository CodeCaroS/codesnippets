import { Router } from 'express';
import { z } from 'zod';
import { BuildPreviewDocumentUseCase } from '../../application/use-cases/build-preview-document.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/async-handler.js';

const schema = z.object({
  executionId: z.string().uuid(),
  html: z.string().default(''),
  css: z.string().default(''),
  javascript: z.string().default(''),
});

export const createRunnerRouter = (useCase: BuildPreviewDocumentUseCase): Router => {
  const router = Router();

  router.post('/', validate(schema), asyncHandler(async (request, response) => {
    response.json(await useCase.execute(request.body));
  }));

  return router;
};
