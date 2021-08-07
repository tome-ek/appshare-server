import {
  DataTypes,
  Model,
  BuildOptions,
  Association,
  HasManyCreateAssociationMixin,
  HasManyAddAssociationMixin,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';
import Build, { BuildProps } from './build.model';
import Session from './session.model';
import ShareLink, { ShareLinkProps } from './shareLink.model';

export interface AppProps extends Model {
  readonly id?: number;
  readonly userId: number;
  readonly name: string;
  readonly bundleIdentifier: string;
  readonly iconUrl: string;

  readonly createBuild: HasManyCreateAssociationMixin<BuildProps>;
  readonly addShareLink: HasManyAddAssociationMixin<ShareLinkProps, number>;

  readonly builds?: BuildProps[];
  readonly shareLinks?: ShareLinkProps[];

  associations: {
    builds: Association<AppProps, BuildProps>;
    shareLinks: Association<AppProps, ShareLinkProps>;
  };
}

export type AppStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): AppProps;
};

const App = <AppStatic>sequelize.define(
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

App.hasMany(Build, {
  sourceKey: 'id',
  foreignKey: 'appId',
  as: 'builds',
});
Build.belongsTo(App);

App.hasMany(ShareLink, {
  sourceKey: 'id',
  foreignKey: 'appId',
  as: 'shareLinks',
});
ShareLink.belongsTo(App);

App.hasMany(Session);
Session.belongsTo(App);

export default App;
