import { camelCase } from 'camel-case';
import { createContainer, asFunction, InjectionMode } from 'awilix';

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });
container.loadModules(
  [
    './src/repositories/**/*.ts',
    './src/controllers/**/*.ts',
    './src/services/**/*.ts',
  ],
  {
    formatName: name => camelCase(name),
    resolverOptions: {
      register: asFunction,
    },
  }
);

export default container;
