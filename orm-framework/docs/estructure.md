# Estrutura do Projeto

```
orm-framework/
├── src/
│   ├── core/
│   │   ├── interfaces/
│   │   │   ├── IEntity.ts        # Interface para entidades
│   │   │   ├── IRepository.ts    # Interface para repositórios
│   │   │   ├── IQueryBuilder.ts  # Interface para o Query Builder
│   │   │   ├── IDatabaseConfig.ts # Interface para configuração de banco
│   │   │   └── IConnectionManager.ts # Interface para o gerenciador de conexões
│   │   ├── decorators/
│   │   │   ├── Entity.ts         # Decorador @Entity
│   │   │   ├── Column.ts         # Decorador @Column
│   │   │   ├── PrimaryColumn.ts  # Decorador @PrimaryColumn
│   │   │   ├── Relationship.ts   # Decoradores de relacionamento
│   │   │   └── Lifecycle.ts      # Decoradores para eventos de ciclo de vida
│   │   ├── metadata/
│   │   │   ├── MetadataStorage.ts # Sistema de armazenamento de metadados
│   │   │   └── MetadataParser.ts  # Parser para configurações de metadados
│   │   ├── migrations/
│   │   │   ├── MigrationRunner.ts # Executor de migrações
│   │   │   ├── MigrationGenerator.ts # Gerador de migrações
│   │   │   └── MigrationSchema.ts # Comparador de esquemas
│   │   ├── repositories/
│   │   │   ├── BaseRepository.ts  # Classe base para repositórios
│   │   │   └── RepositoryFactory.ts # Fábrica de repositórios
│   │   ├── query-builder/
│   │   │   ├── QueryBuilder.ts    # Implementação do Query Builder
│   │   │   ├── SQLGenerator.ts    # Gerador de SQL
│   │   │   └── QueryTransform.ts  # Transformador de resultados
│   │   ├── connection/
│   │   │   ├── ConnectionManager.ts # Gerenciador de conexões
│   │   │   ├── DatabaseDriver.ts    # Driver genérico para múltiplos bancos
│   │   │   └── ConnectionPool.ts    # Pool de conexões
│   │   ├── utils/
│   │   │   ├── Logger.ts           # Utilitário de logging
│   │   │   ├── Validator.ts        # Validação de dados
│   │   │   └── Helper.ts           # Outras funções auxiliares
│   │   ├── index.ts                # Ponto de entrada do ORM
│   │   └── config.ts               # Configuração principal do ORM
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── decorators.test.ts  # Testes dos decoradores
│   │   │   ├── metadata.test.ts    # Testes do sistema de metadados
│   │   │   ├── query-builder.test.ts # Testes do Query Builder
│   │   │   ├── repository.test.ts  # Testes dos repositórios
│   │   │   └── connection.test.ts  # Testes do gerenciador de conexões
│   │   ├── integration/
│   │   │   ├── migration.test.ts   # Testes de migração com banco real
│   │   │   └── transaction.test.ts # Testes de transações
│   │   └── e2e/
│   │       ├── orm-e2e.test.ts     # Testes de ponta a ponta
│   │       └── performance.test.ts # Testes de desempenho
│   ├── cli/
│   │   ├── orm-cli.ts              # Ferramenta CLI para gerenciar o ORM
│   │   └── commands/
│   │       ├── migrate.ts          # Comando para executar migrações
│   │       ├── generate-entity.ts  # Comando para criar entidades
│   │       └── debug.ts            # Comando para depuração
├── docs/
│   ├── README.md                   # Introdução ao projeto
│   ├── API.md                      # Documentação da API
│   ├── MIGRATIONS.md               # Guia de migrações
│   └── USAGE.md                    # Exemplos de uso
├── package.json                    # Dependências e scripts NPM
├── tsconfig.json                   # Configuração do TypeScript
├── .eslintrc.js                    # Regras do ESLint
├── .prettierrc                     # Regras do Prettier
├── jest.config.js                  # Configuração do Jest para testes
└── .gitignore                      # Arquivos a serem ignorados pelo Git
```
