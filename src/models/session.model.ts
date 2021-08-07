import { DataTypes, Model, BuildOptions, Association } from 'sequelize';
import { sequelize } from '../infra/sequelize';
import { AppProps } from './app.model';
import Build, { BuildProps } from './build.model';
import Device, { DeviceProps } from './device.model';
import { UserProps } from './user.model';

export interface SessionProps extends Model {
  readonly id?: number;
  readonly sessionId: string;

  readonly buildId: number;
  readonly appId: number;
  readonly deviceId: number;
  readonly userId: number;

  readonly app?: AppProps;
  readonly device?: DeviceProps;
  readonly user?: UserProps;
  readonly build?: BuildProps;
  associations: {
    app: Association<SessionProps, AppProps>;
    device: Association<SessionProps, DeviceProps>;
    user: Association<SessionProps, UserProps>;
    build: Association<SessionProps, BuildProps>;
  };
}
export type SessionStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): SessionProps;
};

const Session = <SessionStatic>sequelize.define(
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

Session.belongsTo(Device);
Session.belongsTo(Build);

export default Session;
