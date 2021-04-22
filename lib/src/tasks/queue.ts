import { Job, Queue, QueueBaseOptions } from 'bullmq';

import env from '../utils/env';
import { Functions } from '../utils/functions';
import logger from '../utils/logger';
import { cronTasks, hourlyTasks, Info, JobDataType, minutelyTasks, secondlyTasks } from './jobs';

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

export const queueBaseOptions: Readonly<QueueBaseOptions> = {
   connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
   }
}

export const queue = new Queue<JobDataType, void, JobName>(name, queueBaseOptions);

const repeatables: Array<{ every: number, infos: Info[] }> = [
   { every: 1000, infos: [...secondlyTasks] },
   { every: 60000, infos: [...minutelyTasks] },
   { every: 3600000, infos: [...hourlyTasks] },
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