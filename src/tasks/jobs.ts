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
export const cronTasks: Info[] = [{
   constructor: CronuJob,
   options: {
      repeat: {
         // Repeat job once every day at 9:00 (pm)
         cron: '* 00 21 * * *'
      }
   }
}];

export const factory = new GenericFactory.Base<JobDataType, JobProcessor>(
   ...Array.from(secondlyTasks.values()).map(info => info.constructor)
);