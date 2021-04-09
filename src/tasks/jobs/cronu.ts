import { Job } from 'bullmq';

import sendEmail, { testMailOptions } from '../../mailer/nodemailer';
import { logger } from '../../utils/logger';
import { JobDataType } from '../jobs';
import { JobName, JobProcessor } from '../queue';

export default class CronuJob implements JobProcessor {
   supply(): JobDataType {
      return 'cronu';
   }
   //process: Processor<JobDataType, void, JobName>;
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      logger.warn(`running cronu job...`);
      sendEmail({...testMailOptions, text: 'cronu job', html: '<h3>Cronu Job</h3>'});
      return;
   }
}