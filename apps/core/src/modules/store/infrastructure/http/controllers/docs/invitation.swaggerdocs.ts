import { applyDecorators } from '@nestjs/common';
import {
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
} from '@nestjs/swagger';

export function GetStoreInvitationDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Get store invitation details',
			description:
				'Retrieve details of an invitation by its ID. Will only succeed if the authenticated user email matches the invitation.',
		}),
		ApiOkResponse({ description: 'Invitation details returned successfully' }),
		ApiForbiddenResponse({
			description: 'Not allowed to view this invitation',
		}),
		ApiNotFoundResponse({ description: 'Invitation not found or expired' })
	);
}

export function AcceptStoreInvitationDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Accept store invitation',
			description: 'Accepts an invitation to a store by its ID.',
		}),
		ApiOkResponse({ description: 'Invitation accepted successfully' }),
		ApiForbiddenResponse({
			description: 'Not allowed to accept this invitation',
		}),
		ApiNotFoundResponse({ description: 'Invitation not found or expired' })
	);
}
