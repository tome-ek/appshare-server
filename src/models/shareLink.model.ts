import {
  DataTypes,
  Model,
  BuildOptions,
  Association,
  HasManyCreateAssociationMixin,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';
import bcrypt from 'bcrypt';
import AppAccess, { AppAccessProps } from './appAccess.model';
import { AppProps } from './app.model';

export interface ShareLinkProps extends Model {
  readonly id?: number;
  readonly userId: number;
  readonly appId: number;
  readonly token: string;
  readonly tokenId: string;
  readonly shareUrl?: string;
  readonly expiresAt: Date;
  readonly isSingleUse: boolean;
  readonly hasPassword: boolean;
  readonly password?: string;

  readonly createAppAccess: HasManyCreateAssociationMixin<AppAccessProps>;

  readonly appAccesses?: ShareLinkProps[];
  readonly app?: AppProps;
  associations: {
    appAccesses: Association<ShareLinkProps, AppAccessProps>;
    app: Association<ShareLinkProps, AppProps>;
  };
}

export type ShareLinkStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): ShareLinkProps;
};

const ShareLink = <ShareLinkStatic>sequelize.define(
  'shareLink',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tokenId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shareUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isSingleUse: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    hasPassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'shareLinks',
    hooks: {
      beforeCreate: async shareLink => {
        const password = shareLink.get('password');
        if (password && typeof password === 'string') {
          const hash = await bcrypt.hash(password, 10);
          shareLink.set('password', hash);
        }
      },
    },
  }
);

ShareLink.hasMany(AppAccess, {
  sourceKey: 'id',
  foreignKey: 'shareLinkId',
  as: 'appAccesses',
});
AppAccess.belongsTo(ShareLink);

export default ShareLink;
