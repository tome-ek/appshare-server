import { DataTypes, Model, BuildOptions, Association } from 'sequelize';
import { sequelize } from '../infra/sequelize';
import { ShareLinkProps } from './shareLink.model';

export interface AppAccessProps extends Model {
  readonly id?: number;
  readonly shareLinkId: number;
  readonly shareLink?: ShareLinkProps;
  associations: {
    shareLink: Association<AppAccessProps, ShareLinkProps>;
  };
}

export type AppAccessStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): AppAccessProps;
};

const AppAccess = <AppAccessStatic>sequelize.define(
  'appAccess',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'appAccesses',
  }
);

export default AppAccess;
