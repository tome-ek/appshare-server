import { DataTypes, Model, BuildOptions } from 'sequelize';
import { sequelize } from '../infra/sequelize';

export interface BuildProps extends Model {
  readonly id?: number;
  readonly appId: number;
  readonly version: string;
  readonly buildNumber: string;
  readonly bundleUrl: string;
  readonly iv?: string;
  readonly authTag?: string;
}
export type BuildStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): BuildProps;
};

const Build = <BuildStatic>sequelize.define(
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
    iv: {
      type: DataTypes.STRING,
    },
    authTag: {
      type: DataTypes.STRING,
    },
  },
  { tableName: 'builds' }
);

export default Build;
