import { Queue, QueueBaseOptions, QueueScheduler, Worker } from 'bullmq';

export const name = "Queue";

export const queueBaseOptions: QueueBaseOptions = {
   connection: {
      host: "localhost",
      port: 6379
   }
}

export let queue: Queue;

export let queueScheduler: QueueScheduler;

export default function init(opts: QueueBaseOptions = queueBaseOptions): void {

   queueScheduler = new QueueScheduler(name, opts);

   queue = new Queue(name, opts);

   queue.add("test", { "message": 123456 }, {
      repeat: {
         every: 10000
      }
   });

   new Worker(name, async job => {
      console.log(`job : ${JSON.stringify(job)}\n`);
   });
}