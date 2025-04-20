/**
 * Interface base para todas as entidade de ORM
 * Define as propriedade e métodos que todas as entidade devem implementar
 */

export interface IEntity<T = any> {
  /**
   * Identificador único de entidade
   * O tipo e genérico para permitir chaves primárias de diferentes tipos (string, number, uuid, etc.)
   */

  id?: any;

  /**
   * Método para validar se a entidade está em um estado válido antesde ser salve
   * @Returns boolean indicando se a entidade é válida
   */
  isValid?(): boolean;

  /**
   * Define métodos opcionais de ciclo que podem ser implementados pelas entidades
   */
  beforeInsert?(): void | Promise<void>;
  afterInsert?(): void | Promise<void>;
  beforeUpdate?(): void | Promise<void>;
  afterUpdate?(): void | Promise<void>;
  beforeDelete?(): void | Promise<void>;
  afterDelete?(): void | Promise<void>;

  /**
   * Método para clonar a entidade
   * @returns Uma nova instância da entidade com os mesmos valores
   */
  clone?(): T;

  /**
   * Método para converter a entidade em um objeto plano
   * @returns Objeto JavaScript plano representando a entidade
   */
  toJSON?(): Record<string, any>;

  /**
   * Método para carregar dados na entidade a partir de um objeto plano
   * @param data Objeto com dados para carregar a entidade
   * @returns A prórpia entidade para permitir encadeamento
   */
  fromJSON?(date: Record<string, any>): T;
}
