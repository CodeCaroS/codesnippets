import { Router } from 'express';
import type { HealthResponse } from '@codesnippets/shared';

export const createHealthRouter = ({
  version,
  isDatabaseConnected,
}: {
  version: string;
  isDatabaseConnected: () => boolean;
}): Router => {
  const router = Router();

  router.get('/', (_request, response) => {
    const connected = isDatabaseConnected();
    const body: HealthResponse = {
      status: connected ? 'ok' : 'degraded',
      version,
      database: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };

    response.json(body);
  });

  return router;
};
