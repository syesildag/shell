import path from 'path';
import { ConnectionOptions } from 'typeorm';

import env, { isProdEnvironment } from '../utils/env';
import logger from '../utils/logger';

export default function getConnectionOptions(): Readonly<ConnectionOptions> {
    let ePath = path.join(process.cwd(), "lib", "dist", "typeorm", "entity") + "/*.js";
    logger.debug(`using entities path ${ePath}`);
    return {
        type: "postgres",
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT ?? 5432,
        username: env.POSTGRES_USER,
        password: env.POSTGRES_PASS,
        database: env.POSTGRES_DATABASE,
        synchronize: !isProdEnvironment,
        logging: false,
        entities: [
            ePath
        ],
    }
};