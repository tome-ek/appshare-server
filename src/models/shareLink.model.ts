import {
  DataTypes,
  Model,
  BuildOptions,
  Association,
  HasManyCreateAssociationMixin,
} from 'sequelize';
import { sequelize } from '../infra/sequelize';
import bcrypt from 'bcrypt';
import appAccess, { AppAccess } from './appAccess.model';
import { App } from './app.model';

/**
 * Represents a share link used to share a build.
 * @typedef {object} ShareLink
 * @property {number} id - Share link id
 * @property {string} token - Authorization token used to identifiy the share link. Can be sent in the Authorization header.
 * @property {string} tokenId - Unique string identifier of the authorization token
 * @property {string} shareUrl - Url to the front end used for sharing the build
 * @property {string} expiresAt - Expiration date of the share link
 * @property {boolean} hasPassword - Is the share link protected by a password
 * @property {string} password - (Optional) Hash of the password for the share link
 */
export interface ShareLink extends Model {
  readonly id?: number;
  readonly token: string;
  readonly tokenId: string;
  readonly shareUrl?: string;
  readonly expiresAt: Date;
  readonly hasPassword: boolean;
  readonly password?: string;

  readonly userId: number;
  readonly appId: number;

  readonly appAccesses?: ShareLink[];
  readonly app?: App;

  readonly createAppAccess: HasManyCreateAssociationMixin<AppAccess>;

  associations: {
    appAccesses: Association<ShareLink, AppAccess>;
    app: Association<ShareLink, App>;
  };
}

export type ShareLinkModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): ShareLink;
};

const shareLink = <ShareLinkModel>sequelize.define(
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
      beforeCreate: async (shareLink) => {
        const password = shareLink.get('password');
        if (password && typeof password === 'string') {
          const hash = await bcrypt.hash(password, 10);
          shareLink.set('password', hash);
        }
      },
    },
  }
);

shareLink.hasMany(appAccess, {
  sourceKey: 'id',
  foreignKey: 'shareLinkId',
  as: 'appAccesses',
});
appAccess.belongsTo(shareLink);

export default shareLink;
