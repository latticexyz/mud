export type RequireKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;

// This allows unions between string literals and `string` without sacrificing autocompletion.
// Workaround for https://github.com/Microsoft/TypeScript/issues/29729
export type StringForUnion = string & Record<never, never>;

// When type inference sees multiple uses of 1 generic, it can only guess
// which of those are supposed to define the generic (and it will be wrong in complex situations).
// This helper explicitly makes a type that's dependent on some generic,
// and will not be inferred as the generic's definition.
export type AsDependent<T> = T extends infer P ? P : never;

// Helper type to turn `A | B` into `A & B`
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// Helper type to extract and merge the return types of a given union of functions
export type MergeReturnType<T extends (...args: any) => any> = UnionToIntersection<ReturnType<T>>;
