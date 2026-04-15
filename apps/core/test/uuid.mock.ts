import { randomUUID } from 'crypto';

export const v4 = () => randomUUID();
export const v5 = () => randomUUID();
export const validate = () => true;
export default { v4, v5, validate };
