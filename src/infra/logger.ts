import pino from 'pino';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    ignore: 'pid,hostname,time',
  },
});

const logger = pino(transport);

export const log = (message: unknown): void => {
  if (process.env.NODE_ENV !== 'test') {
    logger.info(`${message}`);
  }
};
