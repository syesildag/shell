import { QueueEvents } from 'bullmq';

import logger from '../utils/logger';
import { name, queueBaseOptions } from './queue';

function log(...args: any[]) {
   logger.debug(`Job ${JSON.stringify(args)}`);
}

const queueEvents = new QueueEvents(name, queueBaseOptions);

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

export default queueEvents;