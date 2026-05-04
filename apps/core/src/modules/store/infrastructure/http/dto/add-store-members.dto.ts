import { createZodDto } from 'nestjs-zod';
import { addStoreMembersSchema } from '../../../domain/schemas/add-store-members.zodschema';

export class AddStoreMembersDto extends createZodDto(addStoreMembersSchema) {}
