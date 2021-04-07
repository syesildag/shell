import { Job, Queue, QueueBaseOptions, QueueScheduler, Worker } from 'bullmq';

import { Config } from '../config';
import { Functions } from '../utils/functions';
import { factory, JobDataType, secondlyTasks } from './jobs';

export interface JobProcessor<
   T extends JobDataType = JobDataType,
   R extends JobReturnType = JobReturnType,
   N extends JobName = JobName>
   extends Functions.Supplier<T> {
   supply(): T;
   process(job: Job<T, R, N>): Promise<R>;
}

export type JobName = string;

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

export const workers: Worker[] = [];

export default function init(opts: QueueBaseOptions = queueBaseOptions): void {

   queueScheduler = new QueueScheduler(name, opts);

   queue = new Queue<JobDataType, void, JobName>(name, opts);

   for (const [dataType, info] of secondlyTasks.entries()) {
      console.log(`adding job ${dataType} to queue.`);
      queue.add(`secondly-${dataType}`, dataType as JobDataType, {
         repeat: {
            ...info.options,
            every: 1000
         }
      });
   }

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
}