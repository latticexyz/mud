// https://github.com/arktypeio/arktype/blob/93e79fa3d28567b7547e8e2df9a84e3c5b86e8e1/src/utils/generics.ts#L23
export type evaluate<t> = { [k in keyof t]: t[k] } & unknown;
