import { Setting } from "../entities/Setting";
import { AppDataSource } from "../database/data-source";

export const SettingsRepository = AppDataSource.getRepository(Setting);
