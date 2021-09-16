import {
  DataTypes,
  Model,
  BuildOptions,
  BelongsToGetAssociationMixin,
  Association,
  HasManyCreateAssociationMixin,
  HasManyAddAssociationMixin,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';

import { Account } from './account.model';
import app, { App } from './app.model';
import session from './session.model';
import shareLink, { ShareLink } from './shareLink.model';

/**
 * Represents an account of a user.
 * @typedef {object} User
 * @property {number} id - User id
 * @property {number} accountId - Id of the user's Account
 */
export interface User extends Model {
  readonly id?: number;

  readonly accountId: number;

  readonly shareLinks?: ShareLink[];
  readonly apps?: App[];

  readonly getAccount: BelongsToGetAssociationMixin<Account>;
  readonly createApp: HasManyCreateAssociationMixin<App>;
  readonly addShareLink: HasManyAddAssociationMixin<ShareLink, number>;

  associations: {
    apps: Association<User, App>;
    shareLinks: Association<User, ShareLink>;
  };
}
export type UserModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): User;
};

const user = <UserModel>sequelize.define(
  'user',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
  },
  { tableName: 'users' }
);

user.hasMany(app, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'apps',
});

app.belongsTo(user);

user.hasMany(shareLink, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'shareLinks',
});
shareLink.belongsTo(user);
session.belongsTo(user);

export default user;
