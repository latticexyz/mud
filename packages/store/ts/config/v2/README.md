# Config conventions

These are the types and functions that should be placed in a file called `x.ts`

```ts
/**
 * validateX returns input if the input is valid and expected type otherwise.
 * This makes it such that there are fine grained (and custom) type errors on the input of defineX.
 */
type validateX<x> = { [key in keyof x]: x[key] extends Expected ? x[key] : Expected };

/**
 * validateX function throws a runtime error if x is not X and has a type assertion
 */
function validateX(x: unknonw): asserts x is X {
  //
}

/**
 * resolveX expects a valid input type and maps it to the resolved output type
 */
type resolveX<x> = x extends X ? { [key in keyof x]: Resolved } : never;

/**
 * resolveX function does not validate the input but expects a resolved input.
 * This function is used by defineX and other higher level resolution functions.
 */
function resolveX<const x extends X>(x: x): resolveX<x> {
  //
}

/**
 * defineX function validates the input types and calls resolveX to resolve it.
 * Runtime validation also acts as a type assertion to be able to call the resolvers.
 */
function defineX<const x>(x: validateX<x>): resolveX<x> {
  validateX(x);
  return resolveX(x);
}
```

There are two files that fall out of this patten: `input.ts` and `output.ts`:

- `input.ts` includes the flattened input types. They are supposed to be broad and not include all constraints. The stronger constraints are implemented in the `validateX` helpers.
- `output.ts` includes the flattened output types. They are supposed to be broad so downstream consumers can use them as input types for working with the config, and strongly typed config outputs will be assignable to them.
