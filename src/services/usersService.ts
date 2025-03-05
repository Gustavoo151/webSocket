import { UsersRepository } from "../repositories/UsersRepository";

export class UsersService {
  async create(email: string) {
    const userExists = await UsersRepository.findOne({
      where: { email },
    });

    if (userExists) {
      return userExists;
    }

    const user = UsersRepository.create({
      email,
    });

    await UsersRepository.save(user);

    return user;
  }

  async findByEmail(email: string) {
    const user = await UsersRepository.findOne({
      where: { email },
    });
    return user;
  }
}
