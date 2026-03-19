---
name: hexagonal-architecture
description: >
  Comprehensive guidance for designing, scaffolding, reviewing, and refactoring modules
  using Hexagonal Architecture (Ports and Adapters) in TypeScript/NestJS projects.
  Use this skill whenever the user asks to: create a new module, add a feature, review
  existing code for architectural violations, refactor toward hexagonal boundaries, design
  ports/adapters, model domain errors, wire up use cases, structure repositories, or discuss
  dependency rules. Trigger on terms like "use case", "port", "adapter", "domain layer",
  "repository pattern", "application layer", "infrastructure layer", "Result type",
  "DomainError", "mapper", or any request to scaffold a new NestJS feature module.
---

# Hexagonal Architecture Skill

This skill guides the correct design, scaffolding, and review of modules following strict
Hexagonal Architecture (Ports and Adapters). It applies to TypeScript/NestJS codebases but
the principles are framework-agnostic.

---

## Quick Reference: The Three Layers

| Layer | Role | Depends On | Never Depends On |
|---|---|---|---|
| **Domain** | Core | Nothing (pure TS + Zod) | Application, Infrastructure, any framework |
| **Application** | Orchestration | Domain only | Infrastructure, ORM types, HTTP, queues |
| **Infrastructure** | Adapters | Application + Domain | Nothing forbidden — but no business logic here |

**The Dependency Rule:** All arrows point inward. Infrastructure → Application → Domain. Never outward.

---

## Directory Structure

Every feature module must follow this layout exactly:

```
src/modules/<feature>/
├── domain/
│   ├── schemas/          # Zod schemas and inferred TypeScript types
│   ├── ports/            # Interfaces for I/O, persistence, external services
│   ├── errors/           # Domain-specific error classes
│   └── events/           # Domain event type definitions
├── application/
│   └── use-cases/        # One file per use case, implements IUseCase<TIn, TOut, TErr>
└── infrastructure/
    ├── http/
    │   ├── controllers/  # NestJS controllers
    │   └── dto/          # DTOs extending createZodDto(domainSchema)
    │   └── {decorators, guards, pipes}/ # NestJS specific decorators, guards, pipes
    ├── persistence/
    │   ├── repositories/ # Implements domain port interfaces (e.g. DrizzleUserRepository)
    │   └── mappers/      # Translates ORM rows ↔ Domain types
    └── queue/
        ├── producers/    # Enqueue jobs (implements producer port)
        └── consumers/    # Process jobs (calls use cases)
```

---

## Layer Contracts

### Domain Layer [innermost]

The domain is the heart of the application. It defines *what* the system does — not *how*.

**Responsibilities:**
- Pure TypeScript interfaces and types representing your business models
- Zod schemas (`.zodschema.ts`) for validation and type inference
- Custom error classes that represent domain-level failures
- Port interfaces (prefixed `I`) for anything requiring I/O, persistence, or external comms
- Domain event type definitions (plain typed objects, no framework coupling)

**Rules:**
- ALLOWED: `zod`, pure utility types, other domain schemas within the same module
- FORBIDDEN: ORM schemas (Drizzle, Prisma), NestJS decorators (`@Injectable`, `@Module`), any infrastructure SDK (OpenTelemetry, Stripe, Clerk, BullMQ), HTTP types

**Port naming convention:**
```
I<Entity><Capability>   →   IUserRepository, IEmailService, IUserSyncProducer
```

**Domain error convention:**
```typescript
// domain/errors/user-not-found.error.ts
export class UserNotFoundError extends Error {
  readonly _tag = 'UserNotFoundError';
  constructor(userId: string) {
    super(`User ${userId} not found`);
  }
}
```

---

### Application Layer (Use Cases) [middle]

The application layer orchestrates domain logic. It answers: "given this input, which domain operations need to happen, in what order?"

**Responsibilities:**
- One use case per file, one public `execute()` method
- Implements `IUseCase<TInput, TOutput, TError>`
- Returns `Result<T, E>` — never throws for expected failures
- Injects dependencies only via Port DI tokens — never concrete classes
- Wraps observable operations with `tracer.withSpan`

**Rules:**
- ALLOWED: Domain ports, domain schemas, domain errors, Result utilities
- FORBIDDEN: ORM types, Drizzle queries, HTTP request/response types, mapper classes, concrete infrastructure implementations, BullMQ or queue-specific APIs

**Use case skeleton:**
```typescript
// application/use-cases/get-user-profile.use-case.ts
@Injectable()
export class GetUserProfileUseCase implements IUseCase<GetUserProfileInput, UserProfile, UserNotFoundError> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetUserProfileInput): Promise<Result<UserProfile, UserNotFoundError>> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) return err(new UserNotFoundError(input.userId));
    return ok(user);
  }
}
```

**Result type usage:**
- `ok(data)` — success path
- `err(new DomainError())` — expected failure path
- Caller (Controller) inspects `result.ok` and maps to HTTP status

---

### Infrastructure Layer (Adapters) [outermost]

The infrastructure layer is the outer shell. It contains all framework, database, and external API details.

**Responsibilities:**
- Implements domain Port interfaces with concrete technology (Drizzle, BullMQ, Resend, etc.)
- Translates between infrastructure types (ORM rows, API responses) and domain types using **Mappers**
- Hosts NestJS HTTP Controllers, Guards, Interceptors, and Swagger DTOs
- Hosts Queue Producers and Consumers

**Rules:**
- ALLOWED: Domain ports, domain schemas, domain errors, application use cases, ORM schemas, NestJS, any SDK
- FORBIDDEN: leaking ORM or SDK types through a Port return value; placing business logic in controllers or repositories; importing application use cases directly in repositories (wrong direction)

**Repository pattern:**
```typescript
// infrastructure/persistence/repositories/drizzle-user.repository.ts
@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<UserProfile | null> {
    const row = await this.db.query.users.findFirst({ where: eq(users.id, id) });
    if (!row) return null;
    return UserMapper.toDomain(row); // always map before returning
  }
}
```

**Mapper pattern:**
```typescript
// infrastructure/persistence/mappers/user.mapper.ts
export class UserMapper {
  static toDomain(row: typeof users.$inferSelect): UserProfile {
    return UserProfileSchema.parse({ ...row });
  }

  static toPersistence(domain: UserProfile): typeof users.$inferInsert {
    return { id: domain.id, email: domain.email, /* ... */ };
  }
}
```

**HTTP Controller pattern:**
```typescript
// infrastructure/http/controllers/user.controller.ts
@Controller('users')
export class UserController {
  constructor(private readonly getUser: GetUserProfileUseCase) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<UserProfileDto> {
    const result = await this.getUser.execute({ userId: id });
    if (!result.ok) throw new NotFoundException(result.error.message);
    return result.value;
  }
}
```

**DTO pattern (infrastructure only):**
```typescript
// infrastructure/http/dto/update-profile.dto.ts
// The Zod schema lives in domain/schemas — the DTO wrapper lives here
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
```

---

## Common Anti-Patterns & How to Fix Them

### Anti-Pattern 1: ORM Types Leaking into the Domain

**Bad:**
```typescript
// domain/ports/user-repository.port.ts
import { users } from '@core/database/schema'; // VIOLATION: ORM type in domain

export interface IUserRepository {
  save(user: typeof users.$inferInsert): Promise<void>; // VIOLATION: leaks Drizzle
}
```

**Good:**
```typescript
// domain/ports/user-repository.port.ts
import { UserProfile } from '../schemas/user-profile.zodschema';

export interface IUserRepository {
  save(user: UserProfile): Promise<void>; // domain type only
}
// Mapper in infrastructure handles UserProfile → Drizzle insert shape
```

---

### Anti-Pattern 2: Bypassing Ports for Convenience

**Bad:**
```typescript
// application/use-cases/sync-user.use-case.ts
import { UserSyncProducer } from '../../infrastructure/queue/user-sync.producer'; // VIOLATION: concrete class

@Injectable()
export class SyncUserUseCase {
  constructor(private readonly producer: UserSyncProducer) {} // VIOLATION: bypasses port
}
```

**Good:**
```typescript
// domain/ports/user-sync-producer.port.ts
export interface IUserSyncProducer {
  enqueue(payload: UserSyncPayload): Promise<void>;
}

// application/use-cases/sync-user.use-case.ts
@Injectable()
export class SyncUserUseCase {
  constructor(
    @Inject(USER_SYNC_PRODUCER) private readonly producer: IUserSyncProducer, // correct: port
  ) {}
}
// Infrastructure wires UserSyncProducer → USER_SYNC_PRODUCER token in the module
```

---

### Anti-Pattern 3: Framework DTOs in Domain Schemas

**Bad:**
```typescript
// domain/schemas/update-profile.schema.ts
import { createZodDto } from 'nestjs-zod'; // VIOLATION: NestJS in domain

export const UpdateProfileSchema = z.object({ bio: z.string() });
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {} // VIOLATION
```

**Good:**
```typescript
// domain/schemas/update-profile.zodschema.ts
export const UpdateProfileSchema = z.object({ bio: z.string() }); // pure Zod

// infrastructure/http/dto/update-profile.dto.ts
import { UpdateProfileSchema } from '../../../domain/schemas/update-profile.zodschema';
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {} // infra only
```

---

### Anti-Pattern 4: Exceptions for Control Flow

**Bad:**
```typescript
// application/use-cases/get-user.use-case.ts
async execute(input: GetUserInput): Promise<UserProfile> {
  const user = await this.userRepo.findById(input.id);
  if (!user) throw new UserNotFoundError(); // VIOLATION: exception for expected failure
  return user;
}
// Controller relies on a global exception filter — brittle, untestable
```

**Good:**
```typescript
// application/use-cases/get-user.use-case.ts
async execute(input: GetUserInput): Promise<Result<UserProfile, UserNotFoundError>> {
  const user = await this.userRepo.findById(input.id);
  if (!user) return err(new UserNotFoundError(input.id)); // typed failure
  return ok(user);
}

// infrastructure/http/controllers/user.controller.ts
const result = await this.getUser.execute({ id });
if (!result.ok) throw new NotFoundException(); // HTTP concern stays in infra
```

---

### Anti-Pattern 5: Business Logic in Controllers or Repositories

**Bad:**
```typescript
// infrastructure/http/controllers/order.controller.ts
@Post()
async createOrder(@Body() dto: CreateOrderDto) {
  if (dto.items.length === 0) throw new BadRequestException('Cart is empty'); // VIOLATION: domain rule
  const total = dto.items.reduce((sum, i) => sum + i.price * i.qty, 0); // VIOLATION: domain calc
  await this.db.insert(orders).values({ ...dto, total });
}
```

**Good:**
- Cart validation and total calculation belong in the domain or use case
- The controller calls the use case and maps the Result to an HTTP response — nothing more

---

## Wiring: DI Tokens and Module Registration

Each port needs a DI token. Place tokens close to the port interface:

```typescript
// domain/ports/user-repository.port.ts
export const USER_REPOSITORY = Symbol('IUserRepository');
export interface IUserRepository { /* ... */ }
```

Wire in the NestJS module (infrastructure concern):

```typescript
// infrastructure/user.module.ts
@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository }, // binding
    GetUserProfileUseCase,
  ],
  exports: [GetUserProfileUseCase],
})
export class UserModule {}
```

---

## Checklist for New Modules

Before committing a new module, verify:

- [ ] No ORM imports anywhere in `domain/` or `application/`
- [ ] No NestJS decorators (`@Injectable` aside from use cases) in `domain/`
- [ ] Every external dependency (DB, queue, email, etc.) has a Port interface in `domain/ports/`
- [ ] All use cases return `Result<T, E>`, never throw for expected failures
- [ ] Every repository method returns domain types (run through Mapper before returning)
- [ ] DTOs extending `createZodDto` live in `infrastructure/http/dto/`, not in `domain/`
- [ ] DI tokens are defined next to their Port interface
- [ ] No concrete infrastructure class is imported directly in `application/`

---

## Reference Files

For deeper guidance, see:

- `references/result-type.md` — Full `Result<T, E>` API, `ok()`, `err()`, and combinator patterns
- `references/domain-events.md` — How to model, raise, and dispatch domain events through the Outbox pattern
- `references/testing-strategy.md` — Unit testing use cases with mock ports; integration testing repositories

These are loaded on demand. Consult them when the task involves those specific topics.
