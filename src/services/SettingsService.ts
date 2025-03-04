import { getCustomRepository, getTreeRepository, Repository } from "typeorm";
import { Setting } from "../entities/Setting";
import { SettingsRepository } from "../repositories/SettingsRepository";

interface ISettingsCreate {
  chat: boolean;
  username: string;
}

class SettingsService {
  private settingsRepository: Repository<Setting>;

  constructor() {
    this.settingsRepository = getCustomRepository(SettingsRepository);
  }

  async creat({ chat, username }: ISettingsCreate) {
    const userAlreadyExists = await this.settingsRepository.findOne({
      where: { username },
    });

    if (userAlreadyExists) {
      throw new Error("User  Alredy exists!");
    }

    const settings = this.settingsRepository.create({
      chat,
      username,
    });

    await this.settingsRepository.save(settings);

    return settings;
  }

  async findByUsername(username: string) {
    const settings = await this.settingsRepository.find({
      where: { username },
    });

    return settings;
  }

  async update(username: string, chat: boolean) {
    await this.settingsRepository
      .createQueryBuilder()
      .update(Setting)
      .set({ chat })
      .where("username = :username", {
        username,
      })
      .execute();
  }
}

export { SettingsService };
