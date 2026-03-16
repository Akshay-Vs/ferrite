# Ferrite Core — Agent Context
- path apps/core

## Architecture

Hexagonal (ports & adapters) .

```
modules/<feature>/
├── domain/          # Ports (interfaces), schemas (zod), errors
│   ├── ports/       # Repository & use-case interfaces + DI tokens
│   ├── schemas/     # Zod validation schemas, provider-specific mappers
│   └── errors/      # Domain error classes
├── application/     # Use-cases implementing IUseCase<TInput, TOutput>
│   └── use-case/
└── infrastructure/  # Adapters (DB repos, queue workers, HTTP controllers)
    ├── persistance/
    │   ├── repositories/  # Drizzle implementations of repository ports
    │   └── mappers/       # Domain ↔ DB entity mappers
    ├── queue/             # BullMQ producers/consumers
    └── http/              # Controllers, guards, decorators
```

## Key Patterns

- **Result type** — Use-cases return `Result<T, E>` (`Ok`/`Err`), not exceptions. See `@common/interfaces/result.interface`.
- **IUseCase interface** — `execute(input: TInput): Promise<Result<TOutput, TError>>`. See `@common/interfaces/use-case.interface`.
- **DI tokens** — Ports use `Symbol()` tokens (e.g., `USER_REPOSITORY`, `CREATE_USER_UC`) bound in module `providers`.
- **Tracing** — Inject `@Inject(OTEL_TRACER) tracer: ITracer` and wrap operations in `tracer.withSpan(name, fn, attributes)`.
- **Logging** — Use `AppLogger` from `@core/logger/logger.service`. Call `setContext(this.constructor.name)` in constructors.
- **Queue** — Extend `BaseConsumer<T>` / `BaseProducer<T>` from `@core/queue`. Register queues via `BullModule.registerQueue()`.
- **Database** — Inject `@Inject(DB) db: PsqlDB` (Drizzle + postgres-js). `DB` is a global provider from `DatabaseModule`.
- **Imports** — Use `import type` or inline `type` modifier for interfaces used in decorated constructor parameters (`isolatedModules` + `emitDecoratorMetadata`).

## Runtime & Tooling

| Tool       | Version / Notes                                  |
|------------|--------------------------------------------------|
| Runtime    | Bun                                              |
| Framework  | NestJS                                           |
| ORM        | Drizzle ORM (postgres-js driver)                 |
| Queue      | BullMQ (Redis-backed)                            |
| Validation | Zod v4 (`zod/v4`)                                |
| Tracing    | OpenTelemetry                                    |
| Auth       | Clerk (webhook verification via Svix)            |
| Build      | `bun run build` (nest build + tsc-alias)         |
| Monorepo   | Turborepo                                        |

## Path Aliases

Defined in `tsconfig.json`: `@core/*`, `@common/*`, `@modules/*`, `@auth/*`, `@users/*`, `@webhooks/*`.

## Database

- Schemas in `src/core/database/schema/` (Drizzle `pgTable`)
- Enums in `schema/enum.ts`
- Type exports: `User`, `NewUser`, etc. via `$inferSelect` / `$inferInsert`
- Soft deletes via `deletedAt` timestamp (not hard deletes)
