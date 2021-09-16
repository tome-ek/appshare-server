import { DataTypes, Model, BuildOptions, Association } from 'sequelize';
import { sequelize } from '../infra/sequelize';
import { App } from './app.model';
import { User } from './user.model';
import build, { Build } from './build.model';
import device, { Device } from './device.model';

/**
 * Represents a user session of the simulation.
 * @typedef {object} Session
 * @property {number} id - Session id
 * @property {string} sessionId - Short alphanumeric unique identifier of the session
 * @property {number} buildId - Id of the build associated with this session
 * @property {number} appId - Id of the app associated with this session
 * @property {number} deviceId - Id of the device associated with this session
 * @property {number} userId - Id of the user associated with this session
 */
export interface Session extends Model {
  readonly id?: number;
  readonly sessionId: string;

  readonly buildId: number;
  readonly appId: number;
  readonly deviceId: number;
  readonly userId: number;

  readonly app?: App;
  readonly device?: Device;
  readonly user?: User;
  readonly build?: Build;

  associations: {
    app: Association<Session, App>;
    device: Association<Session, Device>;
    user: Association<Session, User>;
    build: Association<Session, Build>;
  };
}
export type SessionModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): Session;
};

const session = <SessionModel>sequelize.define(
  'session',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { tableName: 'sessions' }
);

session.belongsTo(device);
session.belongsTo(build);

export default session;
