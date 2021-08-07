import {
  DataTypes,
  Model,
  BuildOptions,
  BelongsToGetAssociationMixin,
  Association,
  HasManyCreateAssociationMixin,
  HasManyAddAssociationMixin,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';
import { AccountProps } from './account.model';
import App, { AppProps } from './app.model';
import Session from './session.model';
import ShareLink, { ShareLinkProps } from './shareLink.model';
export interface UserProps extends Model {
  readonly id?: number;
  readonly accountId: number;

  readonly getAccount: BelongsToGetAssociationMixin<AccountProps>;
  readonly createApp: HasManyCreateAssociationMixin<AppProps>;
  readonly addShareLink: HasManyAddAssociationMixin<ShareLinkProps, number>;

  readonly apps?: AppProps[];
  readonly shareLinks?: ShareLinkProps[];

  associations: {
    apps: Association<UserProps, AppProps>;
    shareLinks: Association<UserProps, ShareLinkProps>;
  };
}
export type UserStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): UserProps;
};

const User = <UserStatic>sequelize.define(
  'user',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
  },
  { tableName: 'users' }
);

User.hasMany(App, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'apps',
});
App.belongsTo(User);

User.hasMany(ShareLink, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'shareLinks',
});
ShareLink.belongsTo(User);
Session.belongsTo(User);
export default User;
