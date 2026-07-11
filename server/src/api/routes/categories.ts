import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';

export const createCategoriesRouter = (listCategories: () => Promise<Array<{ id: string; name: string }>>): Router => {
  const router = Router();

  router.get('/', asyncHandler(async (_request, response) => {
      const categories = await listCategories();
      response.json({ data: categories, total: categories.length });
  }));

  return router;
};
