import { createCurrencySchema, updateCurrencySchema } from '@ferrite/schema';
import { createZodDto } from 'nestjs-zod';

export class CreateCurrencyDto extends createZodDto(createCurrencySchema) {}

export class UpdateCurrencyDto extends createZodDto(updateCurrencySchema) {}
