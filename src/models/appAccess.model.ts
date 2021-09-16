import { DataTypes, Model, BuildOptions, Association } from 'sequelize';
import { sequelize } from '../infra/sequelize';
import { ShareLink } from './shareLink.model';

/**
 * Represents an access to an app required for starting a simulator session.
 * @typedef {object} AppAccess
 * @property {number} id - App access id
 */
export interface AppAccess extends Model {
  readonly id?: number;
  readonly shareLinkId: number;

  readonly shareLink?: ShareLink;

  associations: {
    shareLink: Association<AppAccess, ShareLink>;
  };
}

export type AppAccessModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): AppAccess;
};

const appAccess = <AppAccessModel>sequelize.define(
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

export default appAccess;
