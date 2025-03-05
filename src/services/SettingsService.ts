import { Setting } from "../entities/Setting";
import { SettingsRepository } from "../repositories/SettingsRepository";

interface ISettingsCreate {
  chat: boolean;
  username: string;
}

export class SettingsService {
  async creat({ chat, username }: ISettingsCreate) {
    const userAlreadyExists = await SettingsRepository.findOne({
      where: { username },
    });

    if (userAlreadyExists) {
      throw new Error("User  Alredy exists!");
    }

    const settings = SettingsRepository.create({
      chat,
      username,
    });

    await SettingsRepository.save(settings);

    return settings;
  }

  async findByUsername(username: string) {
    const settings = await SettingsRepository.find({
      where: { username },
    });

    return settings;
  }

  async update(username: string, chat: boolean) {
    await SettingsRepository.createQueryBuilder()
      .update(Setting)
      .set({ chat })
      .where("username = :username", {
        username,
      })
      .execute();
  }
}
