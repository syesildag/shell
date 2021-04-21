import { Connection, ConnectionNotFoundError, createConnection, EntityTarget, getConnection } from 'typeorm';

import { isDevEnvironment } from '../utils/environment';
import logger from '../utils/logger';
import { Utils } from '../utils/utils';
import getConnectionOptions from './ormconfig';

async function connect() {
   let connection: Connection;
   try {
      connection = getConnection();
      if (isDevEnvironment) {
         logger.warn("closing existing typeorm connection");
         await connection.close();
         connection = await createConnection(getConnectionOptions());
      }
   } catch (error) {
      if (error instanceof ConnectionNotFoundError) {
         logger.warn("typeorm connection not found");
         connection = await createConnection(getConnectionOptions());
      }
      else {
         logger.error(error, "unhandled typeorm connection error");
         throw error;
      }
   }

   if (connection) {
      let getRepository = connection.getRepository.bind(connection);
      connection.getRepository = <Entity>(target: EntityTarget<Entity>) => {
         if (Utils.isFunction(target))
            return getRepository(target.name);
         return getRepository(target);
      }
   }

   return connection;
}

export default connect;