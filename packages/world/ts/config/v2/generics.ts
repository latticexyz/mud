export type freeze<T> =
  T extends Array<infer R>
    ? ReadonlyArray<freeze<R>>
    : T extends object
      ? { readonly [P in keyof T]: freeze<T[P]> }
      : T;
