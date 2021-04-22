import { JobsOptions } from 'bullmq';

import { GenericFactory } from '../utils/genericFactory';
import CronuJob from './jobs/cron/cronu';
import HouruJob from './jobs/hour/houru';
import { JobProcessor } from './queue';

export type JobDataType = 'houru' | 'cronu';

export interface Info {
   constructor: GenericFactory.Constructor<JobDataType, JobProcessor>,
   options?: JobsOptions
}

export const secondlyTasks: readonly Readonly<Info>[] = [
];

export const minutelyTasks: readonly Readonly<Info>[] = [
];

export const hourlyTasks: readonly Readonly<Info>[] = [
   { constructor: HouruJob }
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
export const cronTasks: readonly Readonly<Info>[] = [{
   constructor: CronuJob,
   options: {
      repeat: {
         // Repeat job once every day at 11:35:40 (am)
         cron: '40 35 11 * * *'
      }
   }
}];

export const factory = new GenericFactory.Base<JobDataType, JobProcessor>(
   ...
   [
      secondlyTasks,
      minutelyTasks,
      hourlyTasks,
      cronTasks
   ]
      .map(t => t.values())
      .map(values => Array.from(values))
      .reduce((a, b) => a.concat(b), [])
      .map(info => info.constructor)
);