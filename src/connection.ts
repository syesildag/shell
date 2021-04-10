import { createConnection } from 'typeorm';

import config from './ormconfig';

const connection = createConnection(config);

export default connection;