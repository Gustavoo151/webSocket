/**
 * Interface genérica para repositórios do ORM
 * Define operações padrão de acesso e manipulção de dados que todos os repositórios dev
 */

export interface FindOptions {
  skip?: number;
  take?: number;
  order?: Record<string, "ASC" | "DESC">;
  relations?: string[];
}

export interface IRepository<Entity, IdType = any> {
  /**
   * Busca uma entidade pelo seu ID
   * @param id O identificador único da entidade
   * @param relations Relacionamentos opcionais para carregar junto com a entidade
   * @retuns Promisse que resolve para entidade encontrada ou null
   */
  findById(id: IdType, relations?: string[]): Promise<Entity | null>;

  /**
   * Busca entidades com base em critérios específicos
   * @param criteria Objetos com condições para filtrar as entidades
   * @param options Opções adicionais como ordenação, paginação, etc.
   * @returns Promise que resolve para um array de entidades
   */
  find(
    criteria?: Record<string, any>,
    options?: FindOptions
  ): Promise<Entity[]>;
}
