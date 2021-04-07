import { GenericFactory } from '../utils/genericFactory';
import BuilderJob from './jobs/builder';
import InvalidatorJob from './jobs/invalidator';
import { JobProcessor } from './queue';

export type JobDataType = 'invalidator' | 'builder';

export const secondlyTasks: Record<JobDataType, GenericFactory.Constructor<JobDataType, JobProcessor>> = {
   "invalidator": InvalidatorJob,
   "builder": BuilderJob
};