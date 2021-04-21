import { Job } from 'bullmq';

import logger from '../../utils/logger';
import { JobDataType } from '../jobs';
import { JobName, JobProcessor } from '../queue';

export default class SecuJob implements JobProcessor {
   supply(): JobDataType {
      return 'secu';
   }
   //process: Processor<JobDataType, void, JobName>;
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      logger.warn(`running secu job ${JSON.stringify(job)}`);
      return;
   }
}