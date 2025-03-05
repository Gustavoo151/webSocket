import { MessagesRepository } from "../repositories/MessagesRepository";

interface IMessageCreate {
  admin_id?: string;
  text: string;
  user_id: string;
}

export class MessagesService {
  constructor() {}

  // Aqui criamos uma mensagem ligada a um usuário
  async create({ admin_id, text, user_id }: IMessageCreate) {
    const message = MessagesRepository.create({
      admin_id,
      text,
      user_id,
    });

    await MessagesRepository.save(message);

    return message;
  }

  async listByUser(user_id: string) {
    const list = await MessagesRepository.find({
      where: { user_id },
      relations: ["user"],
    });

    return list;
  }
}
