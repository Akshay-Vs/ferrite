# Users Module

## Overview

The `Users` module is responsible for managing user profiles, platform-level roles, and keeping the local database synchronized with external authentication providers (like Clerk or Kinde).

## Responsibilities

-   **Profile Management**: Storing and updating user profile information (e.g., first name, last name).
-   **Platform RBAC**: Managing platform-level roles (e.g., "Admin", "Staff", "User") distinct from store-level roles.
-   **Auth Provider Synchronization**: 
    -   **Ingestion**: Receives webhooks from external identity providers (IdPs) when users sign up or are deleted externally, creating corresponding local user records.
    -   **Egress (Outbox Pattern)**: When a user updates their profile locally, this module uses the Transactional Outbox pattern to atomically save the profile change and queue a `user.updated` event. A background worker then processes this queue to update the external IdP, ensuring consistency.

## Interactions with Other Modules

-   **Onboarding Module**: The Users module exports `USER_REPOSITORY` and the `buildUserUpdateOutboxEvent` utility. The Onboarding module utilizes these (via the `IUserDelegate` infrastructure adapter) to update the user's name during the `ABOUT_ME` onboarding step. Because it uses the shared outbox utility, changes made during onboarding correctly sync back to the external IdP.
-   **Queue Module**: Relies heavily on the queue infrastructure to process outbox events (e.g., `USER_SYNC_QUEUE`) reliably in the background.

## Architecture Highlights

-   **Transactional Outbox**: To prevent split-brain scenarios between the local DB and Clerk/Kinde, mutations like `InitiateProfileUpdateUseCase` write the local DB change and a queue payload in the exact same database transaction.
-   **Webhook Mappers**: Uses an adapter pattern (`IWebhookMapper`) to normalize payloads from different IdPs into a standard `EventPayload`.

## Metadata Synchronization Flow

The `Users` module manages the synchronization of `publicMetadata` (like roles and onboarding state) to external identity providers using a structured egress pipeline:

1.  **Initiation**: A use case (e.g., `InitiateRoleUpdateUseCase`) or an external delegate (e.g., `UserDelegateAdapter` from the Onboarding module) initiates an update.
2.  **Outbox Construction**: It uses the `buildUserUpdateOutboxEvent` utility to construct a `QueueParams<UserUpdatedEvent>`. This payload explicitly includes fields destined for the IdP's `publicMetadata`.
3.  **Atomic Persistence**: The repository (`updateProfileById` or `updateRoleById`) persists the local database change and the outbox event within a single transaction.
4.  **Queue Processing**: The `UserSyncProcessor` picks up the job and invokes `SyncProfileUpdateUseCase`.
5.  **Payload Mapping**: The `SyncProfileUpdateUseCase` validates the event and maps relevant fields (name, `role`, `onBoardingState`) into a generic `UserUpdatePayload`.
6.  **Provider Execution**: The configured `AuthProvider` (e.g., `ClerkAdapter`) receives the payload, maps it to the IdP-specific format (e.g., `clerkPayload.publicMetadata`), and executes the final API call (e.g., `clerkClient.users.updateUser`).
