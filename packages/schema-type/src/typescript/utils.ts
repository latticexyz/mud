import { Hex } from "viem";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleSplit<T, N extends number, O extends readonly any[] = readonly []> = O["length"] extends N
  ? [O, T]
  : T extends readonly [infer F, ...infer R]
    ? TupleSplit<readonly [...R], N, readonly [...O, F]>
    : [O, T];

export type LiteralToBroad<T> =
  T extends Readonly<Array<infer Element>>
    ? readonly LiteralToBroad<Element>[]
    : T extends Array<infer Element>
      ? LiteralToBroad<Element>[]
      : T extends number
        ? number
        : T extends bigint
          ? bigint
          : T extends Hex
            ? Hex
            : T extends boolean
              ? boolean
              : T extends string
                ? string
                : never;
