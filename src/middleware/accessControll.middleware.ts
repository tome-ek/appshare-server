import Boom from '@hapi/boom';
import { RequestHandler } from 'express';
import { Model as SequelizeModel, ModelCtor } from 'sequelize';

export type ModelType<ModelAttributes, CreationAttributes> = SequelizeModel<
  ModelAttributes,
  CreationAttributes
>;
export type Model<ModelAttributes, CreationAttributes> = ModelCtor<
  ModelType<ModelAttributes, CreationAttributes>
>;

type ObjectAccessKey = string;

type Object<M, C> = [Model<M, C>, ObjectAccessKey];

export const userOwns = <ObjectModelAttributes, ObjectCreationAttributes>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  object: Object<ObjectModelAttributes, ObjectCreationAttributes>
): RequestHandler => {
  const [accessedModel, objectAccessKey] = object;

  return async (req, _res, next) => {
    const accessedObject = await accessedModel.findByPk(
      req.params[objectAccessKey]
    );

    if (accessedObject) {
      const matches =
        Number(req.params._userId) === accessedObject.get('userId');
      if (matches) {
        next();
      } else {
        next(Boom.forbidden());
      }
    } else {
      next(Boom.notFound());
    }
  };
};
