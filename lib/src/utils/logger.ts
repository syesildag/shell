import pino from 'pino';

import env, { isProdEnvironment } from './env';

const logger = pino({
   name: "shell",
   level: env.LOG_LEVEL ?? "warn",
   prettyPrint: !isProdEnvironment || env.LOG_PRETTY_PRINT,
});

export default logger;