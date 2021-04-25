import { JobsOptions } from 'bullmq';

import { GenericFactory } from '../utils/genericFactory';
import XmlTvTask from './jobs/cron/xmlTvTask';
import { JobProcessor } from './queue';

export type JobDataType = 'xmlTv';

export interface Info {
   constructor: GenericFactory.Constructor<JobDataType, JobProcessor>,
   options?: JobsOptions
}

export const secondlyTasks: readonly Readonly<Info>[] = [
];

export const minutelyTasks: readonly Readonly<Info>[] = [
];

export const hourlyTasks: readonly Readonly<Info>[] = [
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
   constructor: XmlTvTask,
   options: {
      repeat: {
         // Repeat job once every day at 04:10:15 (am)
         cron: '15 10 04 * * *'
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