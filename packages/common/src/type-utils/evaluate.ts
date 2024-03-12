export type evaluate<t> = { [k in keyof t]: t[k] } & unknown;
