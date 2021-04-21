import pino from 'pino';

import Config from '../config';
import { isProdEnvironment } from './environment';

const logger = pino({
   name: "shell",
   level: Config.LOG_LEVEL || "warn",
   prettyPrint: !isProdEnvironment || Config.LOG_PRETTY_PRINT,
});

export default logger;