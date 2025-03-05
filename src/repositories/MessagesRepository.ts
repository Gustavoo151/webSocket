import { Message } from "../entities/Message";
import { AppDataSource } from "../database/data-source";

export const MessagesRepository = AppDataSource.getRepository(Message);
