import { Express } from 'express';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import basicAuth from 'express-basic-auth';
export const documentationController = (app: Express): void => {
  const filesPattern =
    process.env.NODE_ENV === 'production'
      ? '../../../src/**/*.ts'
      : '../**/*.ts';

  const options = {
    info: {
      version: '0.1.0',
      title: 'Appshare',
      description: 'Rest API documentation.',
      license: {
        name: 'AGPL-v3',
      },
    },
    servers: [
      {
        url: 'https://api-appshare-dev.herokuapp.com',
        description: 'The development API server',
      },
    ],
    baseDir: __dirname,
    filesPattern: filesPattern,
    swaggerUIPath: '/docs',
    exposeSwaggerUI: true,
    exposeApiDocs: false,
    notRequiredAsNullable: false,
  };

  expressJSDocSwagger(
    app.use(
      '/docs',
      basicAuth({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        users: { [process.env.DOC_USERNAME!]: process.env.DOC_PASSWORD! },
        challenge: true,
      })
    )
  )(options);
};
