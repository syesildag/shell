import { Job } from 'bullmq';

import { JobDataType } from '../jobs';
import { JobName, JobProcessor } from '../queue';

export default class MinuJob implements JobProcessor {
   supply(): JobDataType {
      return 'minu';
   }
   //process: Processor<JobDataType, void, JobName>;
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      console.log(`running minutely job...`);
      return;
   }
}