export type RequireKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;

// This allows unions between string literals and `string` without sacrificing autocompletion.
// Workaround for https://github.com/Microsoft/TypeScript/issues/29729
export type StringForUnion = string & Record<never, never>;

// When type inference sees multiple uses of 1 generic, it can only guess
// which of those are supposed to define the generic (and it will be wrong in complex situations).
// This helper explicitly makes a type that's dependent on some generic,
// and will not be inferred as the generic's definition.
export type AsDependent<T> = T extends infer P ? P : never;

// If T is defined, return T, else Default
export type OrDefault<T, Default> = T extends undefined ? Default : T;

// For every key occuring in Defaults, map to `T[key] ?? Defaults[key]`
export type OrDefaults<T extends Record<string, unknown>, Defaults> = {
  [key in keyof Defaults]: key extends keyof T ? OrDefault<T[key], Defaults[key]> : Defaults[key];
};
