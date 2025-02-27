import { getCustomRepository, Repository } from "typeorm";
import { Connection } from "../entities/Connection";
import { ConnectionsRepository } from "../repositories/ConnectionsRepository";

interface IConnectionCreate {
  socket_id: string;
  user_id: string;
  admin_id?: string;
  id?: string;
}

class ConnectionsService {
  private connectionsRepository: Repository<Connection>;

  constructor() {
    this.connectionsRepository = getCustomRepository(ConnectionsRepository);
  }

  // Aqui criamos o registro de uma conexão e salvamos no banco de dados
  async create({ socket_id, user_id, admin_id, id }: IConnectionCreate) {
    const connection = this.connectionsRepository.create({
      socket_id,
      user_id,
      admin_id,
      id,
    });

    await this.connectionsRepository.save(connection);

    return connection;
  }

  // Aqui podemos fazer a busca por Id de um usuário
  async findByUserId(user_id: string) {
    const connection = await this.connectionsRepository.findOne({
      where: { user_id },
    });
    return connection;
  }

  // Aqui puxamos todos os usuário menos o Admin
  async findAllWithoutAdmin() {
    const connections = await this.connectionsRepository.find({
      where: { admin_id: null },
      relations: ["user"],
    });

    return connections;
  }

  async findBySocketID(socket_id: string) {
    const connection = await this.connectionsRepository.findOne({
      where: { socket_id },
    });

    return connection;
  }

  async updateAdminID(user_id: string, admin_id: string) {
    await this.connectionsRepository
      .createQueryBuilder()
      .update(Connection)
      .set({ admin_id })
      .where("user_id = :user_id", {
        user_id,
      })
      .execute();
  }

  // Aqui deletamos um user pelo socket_id
  async deleteBySocketid(socket_id: string) {
    await this.connectionsRepository
      .createQueryBuilder()
      .delete()
      .where("socket_id = :socket_id", {
        socket_id,
      })
      .execute();
  }
}

export { ConnectionsService };
