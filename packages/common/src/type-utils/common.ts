export type RequireKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;

// This allows unions between string literals and `string` without sacrificing autocompletion.
// Workaround for https://github.com/Microsoft/TypeScript/issues/29729
export type StringForUnion = string & Record<never, never>;

// When type inference sees multiple uses of 1 generic, it can only guess
// which of those are supposed to define the generic (and it will be wrong in complex situations).
// This helper explicitly makes a type that's dependent on some generic,
// and will not be inferred as the generic's definition.
export type AsDependent<T> = T extends infer P ? P : never;
