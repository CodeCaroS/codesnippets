import { Router } from 'express';
import { TagRepository } from '../../domain/tag-repository.js';
import { asyncHandler } from '../middleware/async-handler.js';

export const createTagsRouter = (repository: TagRepository): Router => {
  const router = Router();

  router.get('/', asyncHandler(async (_request, response) => {
      const tags = await repository.listAll();
      response.json({ data: tags, total: tags.length });
  }));

  return router;
};
