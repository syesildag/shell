import { GenericFactory } from '../utils/genericFactory';
import { secondlyTasks } from './jobList';
import { JobDataType, JobProcessor } from './queue';

export const factory = new GenericFactory.Base<JobDataType, JobProcessor>(
   ...Object.values(secondlyTasks)
);