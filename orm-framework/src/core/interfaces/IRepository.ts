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

export interface SaveOptions {
  data?: any;
  listeners?: boolean;
  transaction?: boolean;
  chunk?: number;
  reload?: boolean;
}

export interface RemoveOptions {
  data?: any;
  listeners?: boolean;
  transaction?: boolean;
  chunk?: number;
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

  /**
   * Busca uma única entidade que corresponde aos critérios
   * @param criteria Objeto com condições de filtro
   * @returns Promise que resolve para a entidade encontrada ou null
   */
  findOne(criteria?: Record<string, any>): Promise<number>;

  /**
   * Conta o número de entidades que correspondem aos critérios
   * @param criteria Objeto com condições de filtro
   * @returns Promise que resolve para o número de entidades
   */
  count(criteria?: Record<string, any>): Promise<number>;

  /**
   * Salva a entidade no banco de dados (inserção ou atualização)
   * @param entity A entidade a ser salva
   * @param options Opções como validação, recarregando, etc.
   * @returns Promise que resolva para a entidade salva
   */
  save(entity: Entity, options?: SaveOptions): Promise<Entity>;

  /**
   * Insere uma nova entidade no banco de dados
   * @param entity A entidade a ser inserida
   * @returns Promise que resolva para a entidade inserida
   */
  insert(entity: Entity): Promise<Entity>;

  /**
   * Atualiza uma entidade existente no banco de dados
   * @param id o identificador da entidade a ser atualizada
   * @param partialEntity Dados parciais para atualização
   * @returns Promise que resolva para a entidade atualizada
   */
  update(id: IdType, partialEntity: Partial<Entity>): Promise<Entity>;

  /**
   * Remove uma entidade do banco de dados
   * @param entityOrId A entidade ou seu ID a ser removido
   * @param options Opções como soft delete
   * @returns Promise que resolve para boolean indicando sucesso
   */
  remove(
    entityOrId: Entity | IdType,
    options?: RemoveOptions
  ): Promise<boolean>;

  /**
   * Cria um QueryBuilder para construção de queries complexas
   * @param alias Alias opcional para a entidade principal
   * @returns Uma instância de queryBuild
   */
  createQueryBuilder(alias?: string): any;
}
