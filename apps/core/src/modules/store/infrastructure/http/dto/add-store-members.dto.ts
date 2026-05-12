import { addStoreMembersSchema } from '@ferrite/schema/stores/add-store-members.zodschema';
import { createZodDto } from 'nestjs-zod';

export class AddStoreMembersDto extends createZodDto(addStoreMembersSchema) {}
