import { Router } from 'express';
import { z } from 'zod';
import type { SearchSnippetsRequest, SearchSnippetsResponse } from '@codesnippets/shared';
import { SearchSnippetsUseCase } from '../../application/use-cases/search-snippets.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { toSnippetDto } from '../serializers/snippet.js';

const schema = z.object({
  text: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
  sort: z.enum(['updatedAt', 'createdAt', 'title']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
}) satisfies z.ZodType<SearchSnippetsRequest>;

export const createSearchRouter = (useCase: SearchSnippetsUseCase): Router => {
  const router = Router();

  router.post('/', validate(schema), asyncHandler(async (request, response) => {
      const snippets = await useCase.execute(request.body as SearchSnippetsRequest);
      response.json({
        data: snippets.map(toSnippetDto),
        total: snippets.length,
      } satisfies SearchSnippetsResponse);
  }));

  return router;
};
