import { Job } from 'bullmq';

import sendEmail, { testMailOptions } from '../../../mailer/nodemailer';
import logger from '../../../utils/logger';
import { JobDataType } from '../../jobs';
import { JobName, JobProcessor } from '../../queue';

export default class CronuJob implements JobProcessor {
   supply(): JobDataType {
      return 'cronu';
   }
   process(job: Job<JobDataType, void, JobName>): Promise<void> {
      logger.debug(`running cronu job ${JSON.stringify(job)}`);
      sendEmail({...testMailOptions, text: 'cronu job', html: '<h3>Cronu Job</h3>'});
      return;
   }
}