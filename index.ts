import dotenv from 'dotenv-flow';
dotenv.config();

import { appshareServer } from './src/infra/server';

appshareServer().start();
