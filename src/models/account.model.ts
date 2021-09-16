import {
  DataTypes,
  Model,
  BuildOptions,
  HasOneCreateAssociationMixin,
  Association,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';
import user, { User } from './user.model';

/**
 * Represents an account of a user.
 * @typedef {object} Account
 * @property {number} id - Account id
 * @property {string} firebaseId - Unique identifier provided by Firebase
 * @property {User} user - (optional) Accociated user object
 */
export interface Account extends Model {
  readonly id?: number;
  readonly firebaseId: string;

  readonly user?: User;

  readonly createUser: HasOneCreateAssociationMixin<User>;

  associations: {
    user: Association<Account, User>;
  };
}

export type AccountModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): Account;
};

const account = <AccountModel>sequelize.define(
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

account.hasOne(user);
user.belongsTo(account);

export default account;
