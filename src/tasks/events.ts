import { QueueEvents } from 'bullmq';

export let queueEvents: QueueEvents;

export default function init(): void {

   queueEvents = new QueueEvents("Events");

   queueEvents.on('waiting', ({ jobId }) => {
      console.log(`A job with ID ${jobId} is waiting`);
   });

   queueEvents.on('removed', ({ jobId }) => {
      console.log(`A job with ID ${jobId} is removed`);
   });

   queueEvents.on('stalled', ({ jobId }) => {
      console.log(`A job with ID ${jobId} is stalled`);
   });

   queueEvents.on('delayed', ({ jobId, delay }) => {
      console.log(`A job with ID ${jobId} is delayed ${delay}`);
   });

   queueEvents.on('drained', (id) => {
      console.log(`A job with ID ${id} is drained`);
   });

   queueEvents.on('progress', ({ jobId, data }, timestamp) => {
      console.log(`${jobId} reported progress ${data} at ${timestamp}`);
   });

   queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`${jobId} has completed and returned ${returnvalue}`);
   });

   queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.log(`${jobId} has failed with reason ${failedReason}`);
   });
}
