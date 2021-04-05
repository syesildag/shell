import { QueueBaseOptions, QueueEvents } from 'bullmq';

import { name, queueBaseOptions } from './queue';

export let queueEvents: QueueEvents;

export default function init(opts: QueueBaseOptions = queueBaseOptions): void {

   queueEvents = new QueueEvents(name, opts);

   queueEvents.on('waiting', ({ jobId }, timestamp) => {
      console.log(`A job with ID ${jobId} is waiting`);
   });

   queueEvents.on('removed', ({ jobId }, timestamp) => {
      console.log(`A job with ID ${jobId} is removed`);
   });

   queueEvents.on('stalled', ({ jobId }, timestamp) => {
      console.log(`A job with ID ${jobId} is stalled`);
   });

   queueEvents.on('delayed', ({ jobId, delay }, timestamp) => {
      console.log(`A job with ID ${jobId} is delayed ${delay}`);
   });

   queueEvents.on('drained', (id) => {
      console.log(`A job with ID ${id} is drained`);
   });

   queueEvents.on('progress', ({ jobId, data }, timestamp) => {
      console.log(`${jobId} reported progress ${data} at ${timestamp}`);
   });

   queueEvents.on('completed', ({ jobId, returnvalue }, timestamp) => {
      console.log(`${jobId} has completed and returned ${returnvalue}`);
   });

   queueEvents.on('failed', ({ jobId, failedReason }, timestamp) => {
      console.log(`${jobId} has failed with reason ${failedReason}`);
   });
}