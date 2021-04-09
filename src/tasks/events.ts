import { QueueBaseOptions, QueueEvents } from 'bullmq';

import { logger } from '../utils/logger';
import { name, queueBaseOptions } from './queue';

export let queueEvents: QueueEvents;

function log(...args: any[]) {
   logger.debug(`Job ${JSON.stringify(args)}`);
}

export default function init(opts: QueueBaseOptions = queueBaseOptions): void {

   queueEvents = new QueueEvents(name, opts);

   queueEvents.on('waiting', (...args) => {
      log(args);
   });

   queueEvents.on('removed', (...args) => {
      log(args);
   });

   queueEvents.on('stalled', (...args) => {
      log(args);
   });

   queueEvents.on('delayed', (...args) => {
      log(args);
   });

   queueEvents.on('drained', (...args) => {
      log(args);
   });

   queueEvents.on('progress', (...args) => {
      log(args);
   });

   queueEvents.on('completed', (...args) => {
      log(args);
   });

   queueEvents.on('failed', (...args) => {
      log(args);
   });
}