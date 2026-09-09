import z from 'zod/v4';

export const zodBoolean = z.preprocess((val) => {
	if (typeof val === 'boolean') return val;
	if (typeof val === 'string') {
		const normalized = val.trim().toLowerCase();
		if (normalized === 'true') return true;
		if (normalized === 'false') return false;
	}
	return val; // pass through unchanged -> z.boolean() will reject it with a clear error
}, z.boolean());
