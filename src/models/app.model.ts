import {
  DataTypes,
  Model,
  BuildOptions,
  Association,
  HasManyCreateAssociationMixin,
  HasManyAddAssociationMixin,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';

import build, { Build } from './build.model';
import session from './session.model';
import shareLink, { ShareLink } from './shareLink.model';

/**
 * Represents a simulated iPhone model.
 * @typedef {object} App
 * @property {number} id - App id
 * @property {string} name - Name of the app
 * @property {string} bundleIdentifier - Bundle identifier of the app in the reverse domain format e.g com.company.appshare
 * @property {string} iconUrl - Url of the app icon image
 * @property {number} userId - Id of the user associated with this app
 */
export interface App extends Model {
  readonly id?: number;
  readonly name: string;
  readonly bundleIdentifier: string;
  readonly iconUrl: string;

  readonly userId: number;

  readonly builds?: Build[];
  readonly shareLinks?: ShareLink[];

  readonly createBuild: HasManyCreateAssociationMixin<Build>;
  readonly addShareLink: HasManyAddAssociationMixin<ShareLink, number>;

  associations: {
    builds: Association<App, Build>;
    shareLinks: Association<App, ShareLink>;
  };
}

export type AppModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): App;
};

const app = <AppModel>sequelize.define(
  'app',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bundleIdentifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    iconUrl: {
      type: DataTypes.STRING,
    },
  },
  { tableName: 'apps' }
);

app.hasMany(build, {
  sourceKey: 'id',
  foreignKey: 'appId',
  as: 'builds',
});
build.belongsTo(app);

app.hasMany(build, {
  sourceKey: 'id',
  foreignKey: 'appId',
  as: 'shareLinks',
});
shareLink.belongsTo(app);

app.hasMany(session);
session.belongsTo(app);

export default app;
