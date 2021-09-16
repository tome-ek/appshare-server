import { DataTypes, Model, BuildOptions } from 'sequelize';
import { sequelize } from '../infra/sequelize';

/**
 * Represents a single build of an app.
 * @typedef {object} Build
 * @property {number} id - Build id
 * @property {number} appId - Id of the app that the build belongs to
 * @property {string} version - Build version
 * @property {string} buildNumber - Build number
 * @property {string} bundleIdentifier - Bundle identifier of the app in the reverse domain format e.g com.company.appshare
 * @property {string} fileName - Name of the build file
 * @property {string} bundleUrl - Url of the build file
 * @property {string} bundleName - Name of the bundle
 * @property {string} iv - Initialization vector used during encryption of the build bundle
 * @property {string} authTag - AuthTag used during encryption of the build bundle
 */
export interface Build extends Model {
  readonly id?: number;
  readonly version: string;
  readonly buildNumber: string;
  readonly bundleIdentifier: string;
  readonly fileName: string;
  readonly bundleUrl: string;
  readonly bundleName: string;
  readonly iv?: string;
  readonly authTag?: string;

  readonly appId: number;
}
export type BuildModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): Build;
};

const build = <BuildModel>sequelize.define(
  'build',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    buildNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bundleUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bundleIdentifier: {
      type: DataTypes.STRING,
    },
    fileName: {
      type: DataTypes.STRING,
    },
    bundleName: {
      type: DataTypes.STRING,
    },
    iv: {
      type: DataTypes.STRING,
    },
    authTag: {
      type: DataTypes.STRING,
    },
  },
  { tableName: 'builds' }
);

export default build;
