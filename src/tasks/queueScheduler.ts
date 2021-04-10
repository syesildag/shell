import { QueueScheduler } from 'bullmq';

import { name, queueBaseOptions } from './queue';

const queueScheduler = new QueueScheduler(name, queueBaseOptions);

export default queueScheduler;