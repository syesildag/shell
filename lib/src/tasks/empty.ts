import Redis from 'ioredis';

import env from '../utils/env';

const redis = new Redis(env.REDIS_PORT, env.REDIS_HOST);

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