import { Job, Queue, QueueBaseOptions, QueueScheduler } from 'bullmq';

import { Config } from '../config';
import { Functions } from '../utils/functions';
import { logger } from '../utils/logger';
import { cronTasks, Info, JobDataType, minutelyTasks, secondlyTasks } from './jobs';

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

export default function init(opts: QueueBaseOptions = queueBaseOptions): void {

   queueScheduler = new QueueScheduler(name, opts);

   queue = new Queue<JobDataType, void, JobName>(name, opts);

   let repeatables: Array<{ every: number, infos: Info[] }> = [
      { every: 1000, infos: [...secondlyTasks] },
      { every: 60000, infos: [...minutelyTasks] },
   ];

   for (const repeatable of repeatables) {
      for (const info of repeatable.infos) {
         const dataType = new info.constructor().supply();
         logger.info(`adding ${repeatable.every} job ${dataType} to queue.`);
         queue.add(`${repeatable.every}-${dataType}`, dataType, {
            ...info.options,
            repeat: {
               ...info.options?.repeat,
               cron: null,
               every: repeatable.every
            }
         });
      }
   }

   for (const info of cronTasks) {
      const dataType = new info.constructor().supply();
      logger.info(`adding cron job ${dataType} to queue.`);
      queue.add(`cron-${dataType}`, dataType, {
         ...info.options,
         repeat: {
            ...info.options?.repeat,
            every: null,
         }
      });
   }
}