import { createConnection } from 'typeorm';

import ormconfig from './ormconfig';

const connection = createConnection(ormconfig);

export default connection;