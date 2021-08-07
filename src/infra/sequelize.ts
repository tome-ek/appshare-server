import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.POSTGRESQL_URL!, {
  logging: false,
});

export const connectSequelize = async () => {
  return await sequelize
    .authenticate()
    .then(() => sequelize.sync({ alter: true }));
};
