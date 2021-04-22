import Redis from 'ioredis';

import { redisOptions } from './queue';

const redis = new Redis(redisOptions);

export default function deleteKeysByPattern(pattern: string) {
   return new Promise((resolve, reject) => {
      const stream = redis.scanStream({
         match: pattern
      });
      stream.on("data", (keys: string[]) => {
         if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach((key) => {
               pipeline.del(key);
            });
            pipeline.exec();
         }
      });
      stream.on("end", () => {
         resolve(null);
      });
      stream.on("error", (e) => {
         reject(e);
      });
   });
};