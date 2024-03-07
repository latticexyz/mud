export type get<input, key> = key extends keyof input ? input[key] : undefined;
