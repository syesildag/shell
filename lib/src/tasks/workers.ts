import { Worker } from 'bullmq';

import env from '../utils/env';
import logger from '../utils/logger';
import { factory, JobDataType } from './jobs';
import { JobName, name, queueBaseOptions } from './queue';

const workers: Worker<JobDataType, void, JobName>[] = [];

for (let index = 0; index < env.NB_TASK_WORKERS; index++) {
   workers.push(
      new Worker<JobDataType, void, JobName>(
         name,
         async job => {
            const processor = factory.create(job.data);
            if (!processor) {
               logger.debug(`no processor for job ${JSON.stringify(job)}`);
               return;
            }
            logger.info(`processing job ${JSON.stringify(job)}`);
            return await processor.process(job);
         },
         queueBaseOptions)
   );
}

export default workers as readonly Worker<JobDataType, void, JobName>[];