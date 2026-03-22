import type { AuthUser } from '@auth/index';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { EventPayload } from '@common/schemas/event-payload.zodschema';
import { UserConflictError } from '../errors/user-conflict.error';
import { UserExistsError } from '../errors/user-exists.error';
import { UserNotFoundError } from '../errors/user-not-found.error';
import type { UpdateProfileInput } from '../schemas/update-profile.zodschema';
import type { UserProfileFull } from '../schemas/user-profile.zodschema';

export const CREATE_USER_UC = Symbol('CREATE_USER_UC');
export const UPDATE_USER_UC = Symbol('UPDATE_USER_UC');
export const ROUTE_USER_EVENTS_UC = Symbol('ROUTE_USER_EVENTS_UC');
export const GET_OWN_PROFILE_UC = Symbol('GET_OWN_PROFILE_UC');
export const UPDATE_OWN_PROFILE_UC = Symbol('UPDATE_OWN_PROFILE_UC');
export const INITIATE_DELETE_USER_UC = Symbol('INITIATE_DELETE_USER_UC');
export const SYNC_USER_DELETION_UC = Symbol('SYNC_USER_DELETION_UC');

/**
 * Creates a new user.
 *
 * Called by UserSyncWorker when a USER_CREATED event is received.
 *
 * @input  EventPayload - the USER_CREATED event payload from the queue job
 * @output void
 * @throws UserExistsError - if the user already exists
 * @throws UserConflictError - if the user already exists but has a different ID
 */
export type ICreateUserUseCase = IUseCase<
	EventPayload,
	void,
	UserExistsError | UserConflictError | Error
>;

/**
 * Gets the user's profile.
 *
 * Called by the HTTP API.
 *
 * @input  AuthUser - the authenticated user
 * @output UserProfileFull - the user's profile
 * @throws UserNotFoundError - if the user does not exist
 */
export type IGetOwnProfileUseCase = IUseCase<
	AuthUser,
	UserProfileFull,
	UserNotFoundError
>;

/**
 * Updates the user's profile.
 *
 * Called by the HTTP API.
 *
 * @input  { authUser: AuthUser; data: UpdateProfileInput } - the authenticated user and their updated profile
 * @output UserProfileFull - the updated user profile
 * @throws UserNotFoundError - if the user does not exist
 */
export type IUpdateOwnProfileUseCase = IUseCase<
	{ authUser: AuthUser; data: UpdateProfileInput },
	UserProfileFull,
	UserNotFoundError
>;

/**
 * Routes user events to the appropriate use-case.
 *
 * Called by the USER_SYNC_QUEUE consumer after the CDC listener
 * forwards the USER_CREATED, USER_UPDATED, and USER_DELETED outbox events.
 * Responsible for routing the event to the appropriate use-case.
 *
 * @input  EventPayload - the USER_CREATED, USER_UPDATED, or USER_DELETED event payload from the queue job
 * @output void
 * @throws Error - if the event type is not supported
 */
export type IRouteUserEventsUseCase = IUseCase<EventPayload, void, Error>;

/**
 * Initiates the user deletion flow.
 *
 * Responsibilities (in order):
 *   1. Verify the user exists
 *   2. Delete the user from the local database
 *   3. Write a USER_DELETED event to the outbox within the same transaction
 *
 * The remaining steps are handled automatically by infrastructure:
 *   - The CDC listener picks up the outbox event via WAL
 *   - The event is forwarded to the USER_SYNC_QUEUE
 *   - ISyncUserDeletionUseCase processes the queue job and calls external providers
 *
 * @input  AuthUser - the authenticated user requesting deletion
 * @output boolean  - true if the user was deleted, false if already gone (idempotent)
 * @throws UserNotFoundError - if the user does not exist
 */
export type IInitiateDeleteUserUseCase = IUseCase<
	AuthUser,
	boolean,
	UserNotFoundError | Error
>;

/**
 * Fulfills the user deletion flow against external providers.
 *
 * Called by the USER_SYNC_QUEUE consumer after the CDC listener
 * forwards the USER_DELETED outbox event. Responsible for propagating
 * the deletion to all third-party services (Kinde, Clerk, etc.).
 *
 * This use case is deliberately decoupled from IInitiateDeleteUserUseCase —
 * it knows nothing about the local database, the outbox, or how it was triggered.
 * It only knows how to delete a user from external providers given a payload.
 *
 * @input  EventPayload - the USER_DELETED event payload from the queue job
 * @output void
 * @throws Error - if any external provider call fails after exhausting retries
 */
export type ISyncUserDeletionUseCase = IUseCase<EventPayload, void, Error>;
