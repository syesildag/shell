import { GenericFactory } from '../utils/genericFactory';
import BuilderJob from './jobs/builder';
import InvalidatorJob from './jobs/invalidator';
import { JobDataType, JobProcessor } from './queue';

export const secondlyTasks: Record<JobDataType, GenericFactory.Constructor<JobDataType, JobProcessor>> = {
   "invalidator": InvalidatorJob,
   "builder": BuilderJob
};