import { Router } from 'express';
import { z } from 'zod';
import type { ImportExportData } from '@codesnippets/shared';
import { ExportSnippetsUseCase } from '../../application/use-cases/export-snippets.js';
import { ImportSnippetsUseCase } from '../../application/use-cases/import-snippets.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/async-handler.js';

const snippetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  sourceUrl: z.string().default(''),
  html: z.string(),
  css: z.string(),
  javascript: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
  favorite: z.boolean(),
  archived: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const schema = z.object({
  snippets: z.array(snippetSchema),
  exportedAt: z.string().datetime(),
  version: z.string().min(1),
});

export const createImportExportRouter = (
  importUseCase: ImportSnippetsUseCase,
  exportUseCase: ExportSnippetsUseCase,
): Router => {
  const router = Router();

  router.post('/import', validate(schema), asyncHandler(async (request, response) => {
      const result = await importUseCase.execute(request.body as ImportExportData);
      response.status(201).json(result);
  }));

  router.get('/export', asyncHandler(async (_request, response) => {
      const payload = await exportUseCase.execute();
      response.json(payload);
  }));

  return router;
};
