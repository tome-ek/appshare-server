import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { Server } from 'http';
import { createFirebaseApp } from './firebase';
import { connectDatabase, sequelize } from './sequelize';
import { registerDependencies } from './awilixContainer';
import { logRequest } from '../middleware/log.middleware';
import { handleInternalError } from '../middleware/internalErrorHandler.middleware';
import { handleNotFoundError } from '../middleware/notFoundErrorHandler.middleware';
import { Socket } from 'net';
import { WebSockets } from './websockets';
import { documentationController } from './documentation';
import { log } from './logger';
import { createHttpTerminator } from 'http-terminator';

export interface AppshareServer {
  shutdown: () => Promise<void>;
  start: () => Promise<void>;
}

export const app = express();

export const appshareServer = (): AppshareServer => {
  let server: Server;
  let webSocketsServer: WebSockets;

  return {
    start: async () => {
      createFirebaseApp();

      await connectDatabase();

      /* misc middlewares */
      app.use(cors());
      if (process.env.NODE_ENV !== 'test') {
        app.use(logRequest);
      }

      /* body parsers */
      app.use(express.urlencoded({ extended: true }));
      app.use(express.json());

      const container = registerDependencies();

      const userController = container.cradle.usersController;
      const accountController = container.cradle.accountsController;
      const userAppController = container.cradle.usersAppsController;
      const usersAppsShareLinksController =
        container.cradle.usersAppsShareLinksController;
      const appController = container.cradle.appsController;
      const appsBuildsController = container.cradle.appsBuildsController;
      const deviceController = container.cradle.devicesController;
      const shareLinkController = container.cradle.shareLinksController;
      const appAccessController = container.cradle.appAccessesController;
      const buildController = container.cradle.buildsController;
      const sessionController = container.cradle.sessionsController;
      const betaCodeController = container.cradle.betaCodesController;
      const usersBuildsController = container.cradle.usersBuildsController;

      /* API routes */
      app.use('/accounts', accountController);
      app.use('/users', userController);
      app.use('/users', userAppController);
      app.use('/users', usersAppsShareLinksController);
      app.use('/users', usersBuildsController);
      app.use('/apps', appController);
      app.use('/apps', appsBuildsController);
      app.use('/builds', buildController);
      app.use('/devices', deviceController);
      app.use('/sessions', sessionController);
      app.use('/beta-codes', betaCodeController);
      app.use('/share-links', shareLinkController);
      app.use('/app-accesses', appAccessController);

      documentationController(app);

      /* error handlers */
      app.use(handleNotFoundError);
      app.use(handleInternalError);

      server = app.listen(process.env.PORT, () => {
        log('Appshare server started.');
      });

      webSocketsServer = container.cradle.webSocketsServer;

      server.on('upgrade', (request, duplex: unknown, head) => {
        const socket = duplex as Socket;
        webSocketsServer.handleUpgrade(request, socket, head);
      });
    },
    shutdown: async () => {
      const httpTerminator = createHttpTerminator({
        server,
      });

      webSocketsServer.shutdown();
      await Promise.all([sequelize.close(), httpTerminator.terminate()]);
    },
  };
};
