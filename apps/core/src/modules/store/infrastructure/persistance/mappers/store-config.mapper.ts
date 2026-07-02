import { type StorePreference } from '@core/database/schema/preferences.schema';
import {
	type StoreConfig,
	StoreConfigSchema,
} from '@ferrite/schema/stores/store-config.zodschema';

export class StoreConfigMapper {
	static toDomain(row: StorePreference): StoreConfig {
		return StoreConfigSchema.parse({
			storeId: row.storeId,
			frontendUrl: row.frontendUrl,
			htmlTemplate: row.htmlTemplate,
			updatedAt: row.updatedAt,
		});
	}
}
