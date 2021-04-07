import { Job } from 'bullmq';

import { JobDataType } from '../jobList';
import { JobName, JobProcessor } from '../queue';

export default class BuilderJob implements JobProcessor {
   supply(): JobDataType {
      return 'builder';
   }
   //process: Processor<JobDataType, void, JobName>;
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      console.log(`running builder job...`);
      return;
   }
}