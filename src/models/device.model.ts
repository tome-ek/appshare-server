import { DataTypes, Model, BuildOptions } from 'sequelize';
import { sequelize } from '../infra/sequelize';

export interface DeviceProps extends Model {
  readonly id?: number;
  readonly name: string;
  readonly systemVersion: string;
  readonly previewImageUrl: string;
  readonly screenWidth?: number;
  readonly screenHeight?: number;
  readonly blueprintId?: string;
}
export type DeviceStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): DeviceProps;
};

const Device = <DeviceStatic>sequelize.define(
  'device',
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
    systemVersion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previewImageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    screenWidth: {
      type: DataTypes.DOUBLE,
    },
    screenHeight: {
      type: DataTypes.DOUBLE,
    },
    blueprintId: {
      type: DataTypes.STRING,
    },
  },
  { tableName: 'devices' }
);

export default Device;
