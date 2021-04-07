import { JobsOptions } from 'bullmq';

import { GenericFactory } from '../utils/genericFactory';
import BuilderJob from './jobs/builder';
import InvalidatorJob from './jobs/invalidator';
import { JobProcessor } from './queue';

export type JobDataType = 'invalidator' | 'builder';

export interface Info {
   constructor: GenericFactory.Constructor<JobDataType, JobProcessor>,
   options?: JobsOptions
}

export const secondlyTasks = new Map<JobDataType, Info>([
   ["invalidator", { constructor: InvalidatorJob }],
   ["builder", { constructor: BuilderJob }]
]);

export const factory = new GenericFactory.Base<JobDataType, JobProcessor>(
   ...Array.from(secondlyTasks.values()).map(info => info.constructor)
);