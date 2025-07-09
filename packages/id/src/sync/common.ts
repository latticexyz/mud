import { type } from "arktype";
import { Hex } from "ox";

const hex = ["string", ":", (s: unknown): s is Hex.Hex => Hex.validate(s, { strict: false })] as const;

export const sharedStateShape = type({
  accounts: [hex, "[]"],
});

export const syncMessageShape = type({
  type: '"sync"',
  at: "Date",
  state: sharedStateShape,
});
