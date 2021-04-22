import { Job } from 'bullmq';

import logger from '../../../utils/logger';
import { JobDataType } from '../../jobs';
import { JobName, JobProcessor } from '../../queue';

export default class HouruJob implements JobProcessor {
   supply(): JobDataType {
      return 'houru';
   }
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      logger.debug(`running houru job ${JSON.stringify(job)}`);
      return;
   }
}