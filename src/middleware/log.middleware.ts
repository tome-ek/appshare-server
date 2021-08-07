import morgan from 'morgan';
import chalk from 'chalk';
export const log = morgan((tokens, req, res) => {
  return [
    chalk.hex('#34ace0')(tokens.method(req, res)),
    chalk.hex('#ffb142').bold(tokens.status(req, res)),
    chalk.hex('#ff5252').bold(tokens.url(req, res)),
    chalk.hex('#2ed573')(tokens['response-time'](req, res) + ' ms'),
  ].join(' ');
});
