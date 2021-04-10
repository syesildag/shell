import { config, grep, ls, pwd, ShellString } from 'shelljs';
import { createConnection } from 'typeorm';

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

const connection = createConnection();
connection.then(connection => {
   // here you can start to work with your entities
   logger.warn("connected!")
}).catch(error => console.log(error));

logger.warn("finish!");

//sendEmail({ ...testMailOptions, text: 'cronu job', html: '<h3>Cronu Job</h3>' });