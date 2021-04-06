import { Job, Queue, QueueBaseOptions, QueueScheduler, Worker } from 'bullmq';

import { Config } from '../config';
import { Functions } from '../utils/functions';
import { factory } from './jobFactory';
import { secondlyTasks } from './jobList';

export interface JobProcessor<T extends JobDataType = JobDataType, R extends JobReturnType = JobReturnType, N extends JobName = JobName> extends Functions.Supplier<T> {
   supply(): T;
   process(job: Job<T, R, N>): Promise<R>;
}

export type JobName = 'daily' | 'weekly' | 'hourly' | 'minutely' | 'secondly';

export type JobDataType = 'invalidator' | 'builder';

export type JobReturnType = void;

export const name = "Queue";

export const queueBaseOptions: QueueBaseOptions = {
   connection: {
      host: Config.redis_host,
      port: Config.redis_port
   }
}

export let queue: Queue<JobDataType, void, JobName>;

export let queueScheduler: QueueScheduler;

export default function init(opts: QueueBaseOptions = queueBaseOptions): void {

   queueScheduler = new QueueScheduler(name, opts);

   queue = new Queue<JobDataType, void, JobName>(name, opts);

   for (const dataType of Object.keys(secondlyTasks))
      queue.add("secondly", dataType as JobDataType, {
         repeat: {
            every: 1000
         }
      });

   for (let index = 0; index < Config.nb_task_workers; index++) {
      new Worker<JobDataType, void, JobName>(name, async job => {
         const processor = factory.create(job.data);
         if (!processor) {
            console.log(`no processor for task ${job.data}`);
            return;
         }
         return await processor.process(job);
      });
   }
}