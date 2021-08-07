require('dotenv').config();
import { connectSequelize } from './src/infra/sequelize';
import firebase from './src/infra/firebase';
import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import container from './src/infra/awilixContainer';
import { notFound } from './src/middleware/notFoundErrorHandler.middleware';
import { internalError } from './src/middleware/internalErrorHandler.middleware';
import { log } from './src/middleware/log.middleware';

(async () => await connectSequelize())();
firebase();

const app = express();
app.use(log);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const accountController = container.cradle.accountController;
const userController = container.cradle.userController;
const userAppController = container.cradle.userAppController;
const userAppShareLinkController = container.cradle.userAppShareLinkController;
const appController = container.cradle.appController;
const deviceController = container.cradle.deviceController;
const shareLinkController = container.cradle.shareLinkController;
const appAccessController = container.cradle.appAccessController;
const sessionController = container.cradle.sessionController;

app.use('/accounts', accountController);
app.use('/users', userController);
app.use('/users', userAppController);
app.use('/users', userAppShareLinkController);
app.use('/apps', appController);
app.use('/devices', deviceController);
app.use('/sessions', sessionController);
app.use('/share-links', shareLinkController);
app.use('/app-accesses', appAccessController);

app.use(internalError);
app.use(notFound);

app.listen(3000, () => {
  console.log('App started.');
});
