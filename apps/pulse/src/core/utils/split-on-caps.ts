export const splitOnCaps = (str: string) =>
	str.replace(/([A-Z])/g, ' $1').trim();
