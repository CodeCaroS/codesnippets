import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ArchiveSnippetUseCase } from '../application/use-cases/archive-snippet.js';
import { BuildPreviewDocumentUseCase } from '../application/use-cases/build-preview-document.js';
import { CreateSnippetUseCase } from '../application/use-cases/create-snippet.js';
import { DeleteSnippetUseCase } from '../application/use-cases/delete-snippet.js';
import { DuplicateSnippetUseCase } from '../application/use-cases/duplicate-snippet.js';
import { ExportSnippetsUseCase } from '../application/use-cases/export-snippets.js';
import { FavoriteSnippetUseCase } from '../application/use-cases/favorite-snippet.js';
import { GetSnippetUseCase } from '../application/use-cases/get-snippet.js';
import { ImportSnippetsUseCase } from '../application/use-cases/import-snippets.js';
import { ListSnippetsUseCase } from '../application/use-cases/list-snippets.js';
import { SearchSnippetsUseCase } from '../application/use-cases/search-snippets.js';
import { UpdateSnippetUseCase } from '../application/use-cases/update-snippet.js';
import { errorHandler } from './middleware/error-handler.js';
import { createCategoriesRouter } from './routes/categories.js';
import { createDocsRouter } from './routes/docs.js';
import { createHealthRouter } from './routes/health.js';
import { createImportExportRouter } from './routes/import-export.js';
import { createRunnerRouter } from './routes/runner.js';
import { createSearchRouter } from './routes/search.js';
import { createSnippetsRouter } from './routes/snippets.js';
import { createTagsRouter } from './routes/tags.js';
import { checkDatabaseConnection, createDatabase } from '../infrastructure/database/database.js';
import { SQLiteSnippetRepository } from '../infrastructure/repositories/sqlite-snippet-repository.js';
import { SQLiteTagRepository } from '../infrastructure/repositories/sqlite-tag-repository.js';

export const createApp = ({
  databasePath,
  version = '0.1.0',
}: {
  databasePath?: string;
  version?: string;
} = {}) => {
  const db = createDatabase(databasePath);
  const snippetRepository = new SQLiteSnippetRepository(db);
  const tagRepository = new SQLiteTagRepository(db);

  const createSnippet = new CreateSnippetUseCase(snippetRepository);
  const updateSnippet = new UpdateSnippetUseCase(snippetRepository);
  const deleteSnippet = new DeleteSnippetUseCase(snippetRepository);
  const duplicateSnippet = new DuplicateSnippetUseCase(snippetRepository);
  const archiveSnippet = new ArchiveSnippetUseCase(snippetRepository);
  const favoriteSnippet = new FavoriteSnippetUseCase(snippetRepository);
  const getSnippet = new GetSnippetUseCase(snippetRepository);
  const listSnippets = new ListSnippetsUseCase(snippetRepository);
  const searchSnippets = new SearchSnippetsUseCase(snippetRepository);
  const importSnippets = new ImportSnippetsUseCase(snippetRepository);
  const exportSnippets = new ExportSnippetsUseCase(snippetRepository);
  const buildPreview = new BuildPreviewDocumentUseCase();

  const app = express();
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    }),
  );
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', createHealthRouter({ version, isDatabaseConnected: () => checkDatabaseConnection(db) }));
  app.use('/api/snippets', createSnippetsRouter({
    createSnippet,
    updateSnippet,
    deleteSnippet,
    duplicateSnippet,
    archiveSnippet,
    favoriteSnippet,
    getSnippet,
    listSnippets,
  }));
  app.use('/api/search', createSearchRouter(searchSnippets));
  app.use('/api/tags', createTagsRouter(tagRepository));
  app.use('/api/categories', createCategoriesRouter(() => snippetRepository.listCategories()));
  app.use('/api', createImportExportRouter(importSnippets, exportSnippets));
  app.use('/api/run', createRunnerRouter(buildPreview));
  app.use('/api/docs', createDocsRouter());
  app.use(errorHandler);

  return app;
};
