import { createZodDto } from 'nestjs-zod';
import { createCurrencySchema } from '../../../domain/schemas/create-currency.zodschema';
import { updateCurrencySchema } from '../../../domain/schemas/update-currency.zodschema';

export class CreateCurrencyDto extends createZodDto(createCurrencySchema) {}

export class UpdateCurrencyDto extends createZodDto(updateCurrencySchema) {}
