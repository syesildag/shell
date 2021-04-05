import initEvents, { queueEvents } from './events';
import initQueue, { queue, queueScheduler } from './queue';

initEvents();
initQueue();

process.once('SIGINT', async (signal: string) => {
   console.log(`Got ${signal}. exiting...`);
   console.log(`closing queueEvents...`);
   await queueEvents.close();
   console.log(`closed queueEvents.`);
   console.log(`closing queueScheduler...`);
   await queueScheduler.close();
   console.log(`closed queueScheduler.`);
   console.log(`closing queue...`);
   await queue.close();
   console.log(`closed queue.`);
   process.exit(0);
});