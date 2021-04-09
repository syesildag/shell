import { JobsOptions } from 'bullmq';

import { GenericFactory } from '../utils/genericFactory';
import BuilderJob from './jobs/builder';
import CronuJob from './jobs/cronu';
import InvalidatorJob from './jobs/invalidator';
import MinuJob from './jobs/minu';
import { JobProcessor } from './queue';

export type JobDataType = 'invalidator' | 'builder' | 'minu' | 'cronu';

export interface Info {
   constructor: GenericFactory.Constructor<JobDataType, JobProcessor>,
   options?: JobsOptions
}

export const secondlyTasks: Info[] = [
   { constructor: InvalidatorJob },
   { constructor: BuilderJob }
];

export const minutelyTasks: Info[] = [
   { constructor: MinuJob }
];

// @see https://github.com/harrisiirak/cron-parser
//*    *    *    *    *    *
//┬    ┬    ┬    ┬    ┬    ┬
//│    │    │    │    │    |
//│    │    │    │    │    └ day of week(0 - 7)(0 or 7 is Sun)
//│    │    │    │    └───── month(1 - 12)
//│    │    │    └────────── day of month(1 - 31, L)
//│    │    └─────────────── hour(0 - 23)
//│    └──────────────────── minute(0 - 59)
//└───────────────────────── second(0 - 59, optional)
export const cronTasks: Info[] = [{
   constructor: CronuJob,
   options: {
      repeat: {
         // Repeat job once every day at 10:25:15 (pm)
         cron: '15 25 22 * * *'
      }
   }
}];

export const factory = new GenericFactory.Base<JobDataType, JobProcessor>(
   ...Array.from(secondlyTasks.values()).map(info => info.constructor),
   ...Array.from(minutelyTasks.values()).map(info => info.constructor),
   ...Array.from(cronTasks.values()).map(info => info.constructor),
);