import { DataTypes, Model, BuildOptions } from 'sequelize';
import { sequelize } from '../infra/sequelize';

/**
 * Represents a beta invitation code.
 * @typedef {object} BetaCode
 * @property {number} id - Beta code id
 * @property {string} code - Beta code string
 * @property {boolean} isRedeemed - Has the beta code already been redeemed
 */
export interface BetaCode extends Model {
  readonly id?: number;
  readonly code: string;
  readonly isRedeemed: boolean;
}

export type BetaCodeModel = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): BetaCode;
};

const betaCode = <BetaCodeModel>sequelize.define(
  'betaCode',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    code: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    isRedeemed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { tableName: 'betaCodes' }
);

export default betaCode;
