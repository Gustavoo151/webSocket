import { Connection } from "../entities/Connection";
import { AppDataSource } from "../database/data-source";

export const ConnectionsRepository = AppDataSource.getRepository(
  Connection
).extend({});
