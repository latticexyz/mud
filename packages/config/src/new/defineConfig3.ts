export type ForceWidening<T> = T extends string
  ? string
  : never | T extends number
  ? number
  : never | T extends bigint
  ? bigint
  : never | T extends boolean
  ? boolean
  : never | T extends any[]
  ? T extends [infer Head, ...infer Tail]
    ? [ForceWidening<Head>, ...ForceWidening<Tail>]
    : []
  :
      | never
      | {
          [K in keyof T]: T[K] extends Function ? T[K] : ForceWidening<T[K]>;
        };
export declare const lambda: unique symbol;

/**
 * Declares basic lambda function with an unique symbol
 * to force other interfaces extending from this type
 */
export interface Lambda<Args = unknown, Return = unknown> {
  args: Args;
  return: Return;
  [lambda]: never;
}

/**
 * Composes two Lambda type functions and returns a new lambda function
 * JS-equivalent:
 *  const compose = (a,b) => (arg) => a(b(arg))
 *
 */
export interface Compose<
  A extends Lambda<ForceWidening<Return<B>>>,
  B extends Lambda<any, Args<A>>,
  I extends Args<B> = Args<B>
> extends Lambda {
  args: I;
  intermediate: Call<B, Args<this>>;
  return: this["intermediate"] extends Args<A> ? Call<A, this["intermediate"]> : never;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyLambda extends Lambda {}

/**
 * Gets return type value from a Lambda type function
 */
export type Call<M extends Lambda, T extends Args<M>> = (M & {
  args: T;
})["return"];
/**
 * Extracts the argument from a lambda function
 */
export type Args<M extends Lambda> = M["args"];

export type Return<M extends Lambda> = M["return"];

export type Primitve = string | number | bigint | boolean | null | undefined;

interface UpperCase extends Lambda<string> {
  return: Uppercase<Args<this>>;
}
interface LowerCase extends Lambda<string> {
  return: Lowercase<Args<this>>;
}

type Test = Call<UpperCase, "asd">; // "ASD"
//   ^?
type ComposeTest = Call<Compose<LowerCase, UpperCase>, "asdasd">; // "asdasd"
//   ^?

////////

interface ConfigInput {
  name: string;
  tables: TablesConfigInput;
}

interface ResolveA extends Lambda<ConfigInput> {
  return: { resolved: Args<this> };
}

interface ResolveB<TConfigInput extends ConfigInput> extends Lambda<TConfigInput> {
  return: TConfigInput & { resolvedA: `${TConfigInput["name"]}-A` };
}

const config = { name: "hello", tables: { table1: { name: "table1" } } } as const satisfies ConfigInput;

type ResolveAB<TConfigInput extends ConfigInput> = Compose<ResolveA<TConfigInput>, ResolveB<TConfigInput>>;
