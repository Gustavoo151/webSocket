import { Connection } from "../entities/Connection";
import { ConnectionsRepository } from "../repositories/ConnectionsRepository";

interface IConnectionCreate {
  socket_id: string;
  user_id: string;
  admin_id?: string;
  id?: string;
}

export class ConnectionsService {
  // Aqui criamos o registro de uma conexão e salvamos no banco de dados
  async create({ socket_id, user_id, admin_id, id }: IConnectionCreate) {
    const connection = ConnectionsRepository.create({
      socket_id,
      user_id,
      admin_id,
      id,
    });

    await ConnectionsRepository.save(connection);

    return connection;
  }

  // Aqui podemos fazer a busca por Id de um usuário
  async findByUserId(user_id: string) {
    const connection = await ConnectionsRepository.findOne({
      where: { user_id },
    });
    return connection;
  }

  // Aqui puxamos todos os usuário menos o Admin
  async findAllWithoutAdmin() {
    const connections = await ConnectionsRepository.find({
      where: { admin_id: null },
      relations: ["user"],
    });

    return connections;
  }

  async findBySocketID(socket_id: string) {
    const connection = await ConnectionsRepository.findOne({
      where: { socket_id },
    });

    return connection;
  }

  async updateAdminID(user_id: string, admin_id: string) {
    await ConnectionsRepository.createQueryBuilder()
      .update(Connection)
      .set({ admin_id })
      .where("user_id = :user_id", {
        user_id,
      })
      .execute();
  }

  // Aqui deletamos um user pelo socket_id
  async deleteBySocketId(socket_id: string) {
    await ConnectionsRepository.createQueryBuilder()
      .delete()
      .where("socket_id = :socket_id", {
        socket_id,
      })
      .execute();
  }
}
