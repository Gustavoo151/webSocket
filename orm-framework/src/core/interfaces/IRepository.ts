export interface IRepository<Entity, IdType = any> {
  /**
   * Busca uma entidade pelo seu ID
   * @param id O identificador único da entidade
   * @param relations Relacionamentos opcionais para carregar junto com a entidade
   * @retuns Promisse que resolve para entidade encontrada ou null
   */
  findById(id: IdType, relations?: string[]): Promise<Entity | null>;
}
