import Redis from 'ioredis';

import Config from '../config';

const redis = new Redis(Config.redis_port, Config.redis_host);

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