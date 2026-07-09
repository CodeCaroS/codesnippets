import { Router } from 'express';

export const createCategoriesRouter = (listCategories: () => Promise<Array<{ id: string; name: string }>>): Router => {
  const router = Router();

  router.get('/', async (_request, response, next) => {
    try {
      const categories = await listCategories();
      response.json({ data: categories, total: categories.length });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
