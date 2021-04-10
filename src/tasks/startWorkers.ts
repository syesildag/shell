import workers from './workers';

process.once('SIGINT', async (signal: string) => {
   console.log(`Got ${signal}. exiting...`);

   console.log(`closing workers...`);
   for (const worker of workers)
      await worker.close();
   console.log(`closed workers.`);

   process.exit(0);
});