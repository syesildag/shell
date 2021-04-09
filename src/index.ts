import { config, grep, ls, pwd, ShellString } from 'shelljs';

import { logger } from './utils/logger';

config.verbose = true;

let present: ShellString = pwd();

logger.info(present.stdout);

let list = ls(`-A`);

logger.info(list.grep('tsconfig').stdout);

let result = grep(`-l`, /config/gi, "src/index*");

result.stdout.split('\n').forEach(file => {
   if (file) {
      let result = grep(/config/gi, file);
      logger.info(result.stdout);
   }
});

//sendEmail().catch(console.error);