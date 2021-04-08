import { Worker } from 'bullmq';

import { Config } from '../config';
import { factory, JobDataType } from './jobs';
import initQueue, { JobName, name } from './queue';

export const workers: Worker<JobDataType, void, JobName>[] = [];
for (let index = 0; index < Config.nb_task_workers; index++)
   workers.push(
      new Worker<JobDataType, void, JobName>(name, async job => {
         const processor = factory.create(job.data);
         if (!processor) {
            console.log(`no processor for job ${JSON.stringify(job)}`);
            return;
         }
         console.log(`processing job ${JSON.stringify(job)}`);
         return await processor.process(job);
      }));

process.once('SIGINT', async (signal: string) => {
   console.log(`Got ${signal}. exiting...`);

   console.log(`closing workers...`);
   for (const worker of workers)
      await worker.close();
   console.log(`closed workers.`);

   process.exit(0);
});