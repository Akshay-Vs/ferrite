# Onboarding Module

## Overview

The `Onboarding` module acts as a backend-authoritative state machine that guides a new user through the necessary setup steps before they can fully use the application. It replaces client-orchestrated flows to prevent state drift and ensure data consistency.

## Responsibilities

-   **State Machine Management**: Tracks a user's progress through predefined onboarding steps (e.g., `ABOUT_ME` → `STORE_CREATION` → `COMPLETED`).
-   **Step Validation**: Guards endpoints to ensure users cannot skip steps or submit data for a step they have already completed.
-   **Cross-Module Orchestration**: Coordinates complex setups spanning multiple domains (Users, Stores) within atomic database transactions.

## Interactions with Other Modules

The Onboarding module acts as an orchestrator and sits "above" core domain modules. It relies heavily on delegation to maintain clean architectural boundaries:

-   **Users Module**: During the `ABOUT_ME` step, the Onboarding module updates the user's profile. It does this via an `IUserDelegate` port. The infrastructure adapter for this port uses the exported `USER_REPOSITORY` and shared outbox utilities from the Users module to perform the update and queue the IdP sync.
-   **Store Module**: During the `STORE_CREATION` step, it provisions a new store. It uses an `IStoreDelegate` port. The adapter wraps the Store module's `InitializeStoreOrchestratorUseCase`, passing in a shared transaction context.
-   **Database Unit of Work (UoW)**: To ensure that an onboarding step transition (e.g., moving to `COMPLETED`) and the associated domain mutation (e.g., creating a store) succeed or fail together, it utilizes the cross-cutting `IUnitOfWork` abstraction from `@common/interfaces`.

## Architecture Highlights

-   **Delegate Pattern**: To avoid tight coupling, the Onboarding domain layer never imports repositories or use cases from `Users` or `Store`. It defines its own ports (`IUserDelegate`, `IStoreDelegate`), which are fulfilled in the infrastructure layer using adapters that wire into the other modules.
-   **Transaction Context**: Uses the opaque `ITransactionContext` to share database transactions across module boundaries without leaking Drizzle ORM types into the domain.
