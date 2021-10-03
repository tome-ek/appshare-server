import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer,
  InjectionMode,
} from 'awilix';
import { camelCase } from 'camel-case';
import decompress from 'decompress';
import { Router } from 'express';
import admin from 'firebase-admin';
import { apiKeyAuthorizationStrategy } from '../middleware/authorization.apiKey.middleware';
import { shareLinkAuthorizationStrategy } from '../middleware/authorization.shareLink.middleware';
import { jwtAuthorizationStrategy } from '../middleware/authorization.jwt.middleware';
import {
  authMiddleware,
  authorizationStrategies,
} from '../middleware/authorization.middleware';
import { appAccessAuthorizationStrategy } from '../middleware/authorization.appAccess.middleware';
import webSocketsServer, { WebSockets } from './websockets';

type ApplicationDepencencies = {
  accountsController: Router;
  usersController: Router;
  usersAppsController: Router;
  usersAppsShareLinksController: Router;
  appsController: Router;
  devicesController: Router;
  shareLinksController: Router;
  appAccessesController: Router;
  buildsController: Router;
  sessionsController: Router;
  betaCodesController: Router;
  webSocketsServer: WebSockets;
};

export const registerDependencies =
  (): AwilixContainer<ApplicationDepencencies> => {
    const container: AwilixContainer<ApplicationDepencencies> = createContainer(
      {
        injectionMode: InjectionMode.CLASSIC,
      }
    );

    const fileExt = process.env.NODE_ENV === 'production' ? 'js' : 'ts';
    const modulesPrefix = process.env.NODE_ENV === 'production' ? '/build' : '';

    container.loadModules(
      [
        `.${modulesPrefix}/src/repositories/**/*.${fileExt}`,
        `.${modulesPrefix}/src/controllers/**/*.${fileExt}`,
        `.${modulesPrefix}/src/services/**/*.${fileExt}`,
      ],
      {
        formatName: (name) => camelCase(name),
        resolverOptions: {
          register: asFunction,
        },
      }
    );

    container.loadModules([`.${modulesPrefix}/src/models/**/*.${fileExt}`], {
      formatName: (name) => {
        const val = name.substr(0, name.length - 6);
        return val.charAt(0).toUpperCase() + val.slice(1);
      },
      resolverOptions: {
        register: asValue,
      },
    });

    container.register('webSocketsServer', asFunction(webSocketsServer));
    container.register('bucket', asValue(admin.storage().bucket()));

    container.register('authorizationService', asValue(admin.auth()));
    container.register('jwtStrategy', asFunction(jwtAuthorizationStrategy));
    container.register(
      'apiKeyStrategy',
      asFunction(apiKeyAuthorizationStrategy)
    );
    container.register(
      'appAccessStrategy',
      asFunction(appAccessAuthorizationStrategy)
    );
    container.register(
      'shareLinkStrategy',
      asFunction(shareLinkAuthorizationStrategy)
    );

    container.register('authStrategies', asFunction(authorizationStrategies));
    container.register('authorize', asFunction(authMiddleware));

    container.register('decompress', asValue(decompress));

    return container;
  };
