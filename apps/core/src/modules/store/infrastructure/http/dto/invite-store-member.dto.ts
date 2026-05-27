import { inviteStoreMemberSchema } from '@ferrite/schema/stores/invite-store-member.zodschema';
import { createZodDto } from 'nestjs-zod';

export class InviteStoreMemberDto extends createZodDto(
	inviteStoreMemberSchema
) {}
