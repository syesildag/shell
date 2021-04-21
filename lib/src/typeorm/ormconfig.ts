import path from 'path';
import { ConnectionOptions } from 'typeorm';

import { isProdEnvironment } from '../utils/environment';
import logger from '../utils/logger';

export default function getConnectionOptions(): Readonly<ConnectionOptions> {
    let ePath = path.join(process.cwd(), "lib", "dist", "typeorm", "entity") + "/*.js";
    logger.warn(`using entities path ${ePath}`);

    return {
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "",
        database: "serkan",
        synchronize: !isProdEnvironment,
        logging: false,
        entities: [
            ePath
        ],
    }
};

// function getEntities() {
//     return [
//         Country,
//         Photo,
//         PhotoMetadata,
//         Author,
//         Album
//     ];
// }