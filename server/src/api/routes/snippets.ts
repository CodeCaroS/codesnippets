import { Router } from 'express';
import { z } from 'zod';
import type { PaginatedResponse, Snippet as SnippetDto, SnippetResponse, UpdateSnippetRequest } from '@codesnippets/shared';
import { CreateSnippetUseCase } from '../../application/use-cases/create-snippet.js';
import { UpdateSnippetUseCase } from '../../application/use-cases/update-snippet.js';
import { DeleteSnippetUseCase } from '../../application/use-cases/delete-snippet.js';
import { DuplicateSnippetUseCase } from '../../application/use-cases/duplicate-snippet.js';
import { ArchiveSnippetUseCase } from '../../application/use-cases/archive-snippet.js';
import { FavoriteSnippetUseCase } from '../../application/use-cases/favorite-snippet.js';
import { GetSnippetUseCase } from '../../application/use-cases/get-snippet.js';
import { ListSnippetsUseCase } from '../../application/use-cases/list-snippets.js';
import { validate } from '../middleware/validation.js';
import { Snippet } from '../../domain/snippet.js';

const paramsSchema = z.object({
  id: z.string().min(1),
});

const createSnippetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  html: z.string().optional(),
  css: z.string().optional(),
  javascript: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

const updateSnippetSchema = createSnippetSchema.partial().extend({
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
}) satisfies z.ZodType<UpdateSnippetRequest>;

const querySchema = z.object({
  archived: z.preprocess((value) => value === undefined ? undefined : value === 'true', z.boolean().optional()),
  favorite: z.preprocess((value) => value === undefined ? undefined : value === 'true', z.boolean().optional()),
  category: z.string().optional(),
  tag: z.preprocess((value) => Array.isArray(value) ? value : value ? [value] : undefined, z.array(z.string()).optional()),
  sort: z.enum(['updatedAt', 'createdAt', 'title']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});

const toSnippetDto = (snippet: Snippet): SnippetDto => ({
  ...snippet,
  createdAt: snippet.createdAt.toISOString(),
  updatedAt: snippet.updatedAt.toISOString(),
});

export const createSnippetsRouter = (dependencies: {
  createSnippet: CreateSnippetUseCase;
  updateSnippet: UpdateSnippetUseCase;
  deleteSnippet: DeleteSnippetUseCase;
  duplicateSnippet: DuplicateSnippetUseCase;
  archiveSnippet: ArchiveSnippetUseCase;
  favoriteSnippet: FavoriteSnippetUseCase;
  getSnippet: GetSnippetUseCase;
  listSnippets: ListSnippetsUseCase;
}): Router => {
  const router = Router();
  const getParamId = (value: string | string[]): string => (Array.isArray(value) ? value[0] ?? '' : value);

  router.get('/', validate(querySchema, 'query'), async (request, response, next) => {
    try {
      const query = request.query as z.infer<typeof querySchema>;
      const snippets = await dependencies.listSnippets.execute({
        archived: query.archived,
        favorite: query.favorite,
        category: query.category,
        tags: query.tag,
        sort: query.sort,
        direction: query.direction,
      });

      const payload: PaginatedResponse<SnippetDto> = {
        data: snippets.map(toSnippetDto),
        total: snippets.length,
        page: 1,
        pageSize: snippets.length,
      };

      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', validate(paramsSchema, 'params'), async (request, response, next) => {
    try {
      const snippet = await dependencies.getSnippet.execute(getParamId(request.params.id));
      const payload: SnippetResponse = { data: toSnippetDto(snippet) };
      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', validate(createSnippetSchema), async (request, response, next) => {
    try {
      const snippet = await dependencies.createSnippet.execute(request.body as z.infer<typeof createSnippetSchema>);
      const payload: SnippetResponse = { data: toSnippetDto(snippet) };
      response.status(201).json(payload);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id', validate(paramsSchema, 'params'), validate(updateSnippetSchema), async (request, response, next) => {
    try {
      const snippet = await dependencies.updateSnippet.execute(
        getParamId(request.params.id),
        request.body as z.infer<typeof updateSnippetSchema>,
      );
      const payload: SnippetResponse = { data: toSnippetDto(snippet) };
      response.json(payload);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', validate(paramsSchema, 'params'), async (request, response, next) => {
    try {
      await dependencies.deleteSnippet.execute(getParamId(request.params.id));
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/duplicate', validate(paramsSchema, 'params'), async (request, response, next) => {
    try {
      const snippet = await dependencies.duplicateSnippet.execute(getParamId(request.params.id));
      response.status(201).json({ data: toSnippetDto(snippet) } satisfies SnippetResponse);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/archive', validate(paramsSchema, 'params'), async (request, response, next) => {
    try {
      const snippet = await dependencies.archiveSnippet.execute(getParamId(request.params.id));
      response.json({ data: toSnippetDto(snippet) } satisfies SnippetResponse);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/favorite', validate(paramsSchema, 'params'), async (request, response, next) => {
    try {
      const snippet = await dependencies.favoriteSnippet.execute(getParamId(request.params.id));
      response.json({ data: toSnippetDto(snippet) } satisfies SnippetResponse);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
