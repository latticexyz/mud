# Config conventions

```ts
/**
 * validateX returns input if the input is valid and expected type otherwise.
 * This makes it such that there are fine grained (and custom) type errors on the input of defineX.
 */
type validateX<x> = { [key in keyof x]: x[key] extends Expected ? x[key] : Expected };

/**
 * resolveX expects a valid input type and maps it to the resolved output type
 */
type resolveX<x> = x extends X ? { [key in keyof x]: Resolved } : never;

/**
 * validateX function throws a runtime error if x is not X
 */
function validateX(x: unknonw): asserts x is X {
  //
}

/**
 * defineX function validates the input and calls resolveX to resolve it.
 */
function defineX<const x>(x: validateX<x>): resolveX<x> {
  validateX(x);
  return resolveX(x);
}

/**
 * resolveX function does not validate but expect a valid input.
 * This function is used by defineX and other higher level resolution functions.
 */
function resolveX<const x extends X>(x: x): resolveX<x> {
  //
}
```
