import chalk from 'chalk';
import morgan from 'morgan';

export const logRequest = morgan((tokens, req, res) => {
  return [
    chalk.hex('#34ace0')(tokens.method(req, res)),
    chalk.hex('#ffb142').bold(tokens.status(req, res)),
    chalk.hex('#ff5252').bold(tokens.url(req, res)),
    chalk.hex('#2ed573')(`${tokens['response-time'](req, res) || 0} ms`),
  ].join(' ');
});
