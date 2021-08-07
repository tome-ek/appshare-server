import {
  DataTypes,
  Model,
  BuildOptions,
  HasOneCreateAssociationMixin,
  Association,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';
import User, { UserProps } from './user.model';

export interface AccountProps extends Model {
  readonly id?: number;
  readonly firebaseId: string;
  readonly createUser: HasOneCreateAssociationMixin<UserProps>;
  readonly user?: UserProps;

  associations: {
    user: Association<AccountProps, UserProps>;
  };
}

export type AccountStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): AccountProps;
};

const Account = <AccountStatic>sequelize.define(
  'account',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    firebaseId: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  { tableName: 'accounts' }
);

Account.hasOne(User);
User.belongsTo(Account);

export default Account;
