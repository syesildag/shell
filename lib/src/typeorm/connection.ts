import { Connection, ConnectionNotFoundError, createConnection, EntityTarget, getConnection } from 'typeorm';

import { isDevEnvironment } from '../utils/env';
import logger from '../utils/logger';
import { Utils } from '../utils/utils';
import getConnectionOptions from './ormconfig';

async function connect() {
   let connection: Connection;
   try {
      connection = getConnection();
      if (isDevEnvironment) {
         logger.debug("closing existing typeorm connection...");
         await connection.close();
         logger.debug("closed existing typeorm connection.");
         logger.debug("creating a new one...");
         connection = await createConnection(getConnectionOptions());
         logger.debug("created a new one.");
      }
   } catch (error) {
      if (error instanceof ConnectionNotFoundError) {
         logger.debug("typeorm connection not found");
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