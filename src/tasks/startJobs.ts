import deleteKeysByPattern from './empty';
import { name, queue } from './queue';
import queueEvents from './queueEvents';
import queueScheduler from './queueScheduler';

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

   console.log(`deleting redis keys...`);
   await deleteKeysByPattern(`bull:${name}:*`);
   console.log(`done.`);

   process.exit(0);
});