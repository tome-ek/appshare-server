import { DataTypes, Model, BuildOptions } from 'sequelize';
import { sequelize } from '../infra/sequelize';

/**
 * Represents a simulated iPhone model.
 * @typedef {object} Device
 * @property {number} id - Device id
 * @property {string} name - Device name. e.g. iPhone 8
 * @property {string} systemVersion - Operating system that the device is using. e.g iOS 14.4
 * @property {string} previewImageUrl - Url of the image that portraits the iPhone model
 * @property {number} screenWidth - Device screen width in pixels
 * @property {number} screenHeight - Device screen height in pixels
 * @property {string} blueprintId - Represents an unique string describing this device.
 */
export interface Device extends Model {
  readonly id?: number;
  readonly name: string;
  readonly systemVersion: string;
  readonly previewImageUrl: string;
  readonly screenWidth?: number;
  readonly screenHeight?: number;
  readonly blueprintId?: string;
}

export type DeviceModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): Device;
};

const device = <DeviceModel>sequelize.define(
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

export default device;
