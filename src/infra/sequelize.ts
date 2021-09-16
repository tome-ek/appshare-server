import { exit } from 'process';
import { Sequelize } from 'sequelize';
import { log } from './logger';

if (!process.env.POSTGRESQL_URL) {
  log('No PostgreSQL URL found in .env');
  exit(1);
}

export const sequelize = new Sequelize(process.env.POSTGRESQL_URL, {
  logging: false,
});

export const connectDatabase = async (): Promise<void> => {
  sequelize
    .authenticate()
    .then(() => {
      if (process.env.NODE_ENV !== 'test') {
        return sequelize.sync({ alter: true });
      }
    })
    .then(() => log('Sequelize connected.'));
};
