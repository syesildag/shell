import { GenericFactory } from '../utils/genericFactory';
import { JobDataType, secondlyTasks } from './jobList';
import { JobProcessor } from './queue';

export const factory = new GenericFactory.Base<JobDataType, JobProcessor>(
   ...Object.values(secondlyTasks).map(info => info.constructor)
);