import { setupUser } from './initializeTestUser';
import { appshareServer as makeServer } from '../../src/infra/server';

const appshareServer = makeServer();

exports.mochaGlobalSetup = async function () {
  this.server = await appshareServer.start();
  await setupUser();
};

exports.mochaGlobalTeardown = async function () {
  await appshareServer.shutdown();
};
