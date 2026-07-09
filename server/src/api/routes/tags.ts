import { Router } from 'express';
import { TagRepository } from '../../domain/tag-repository.js';

export const createTagsRouter = (repository: TagRepository): Router => {
  const router = Router();

  router.get('/', async (_request, response, next) => {
    try {
      const tags = await repository.listAll();
      response.json({ data: tags, total: tags.length });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
