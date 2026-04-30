# Store Module

## Overview

The `Store` module is responsible for managing the multi-tenant aspects of the application. In this domain, a "Store" represents a tenant or workspace. The module handles the lifecycle of stores, store memberships, and granular store-level Role-Based Access Control (RBAC).

## Responsibilities

-   **Store Management**: Creating, updating, fetching, and soft-deleting stores.
-   **Store Membership**: Adding users to stores and managing their membership status.
-   **Store RBAC**: Managing store-specific roles (e.g., "Owner", "Admin", "Member") and their associated permissions.
-   **Permission Checking**: Resolving and verifying if a user has specific permissions within a store context.
-   **Orchestration**: Providing an `InitializeStoreOrchestratorUseCase` that guarantees atomic creation of a store, its default "Owner" role, the necessary permissions, and assigning the creator as the owner.

## Interactions with Other Modules

-   **Onboarding Module**: The Store module exports the `InitializeStoreOrchestratorUseCase` and `STORE_REPOSITORY`. The Onboarding module utilizes these exports (via the `IStoreDelegate` infrastructure adapter) to provision a new store atomically during the final step of the user onboarding flow.
-   **Cross-Module Dependency Rules**: The Store module does not depend on the Users or Onboarding modules. It is a core domain module that exposes its functionality through ports (e.g., `IStoreRepository`, `IStorePermissionChecker`) and concrete orchestrator use cases.

## Architecture Highlights

This module adheres strictly to the Hexagonal Architecture pattern:
-   **Domain**: Defines `Store`, `StoreRole`, `StoreMember`, and schemas for inputs. Ports like `IStoreRepository` are defined here.
-   **Application**: Contains focused Use Cases (`CreateStoreUseCase`, `AddStoreMemberUseCase`, etc.) that implement the business logic.
-   **Infrastructure**: Implements the repositories using Drizzle ORM and exposes HTTP controllers and permission guards.
