export function curry<F extends (...params: [...P, ...any[]]) => any, P extends any[]>(func: F, ...partialParams: P) {
  return ((...args: any[]) => func(...partialParams, ...args)) as CurryParams<F, P>;
}

type CurryParams<F extends (...params: [...PartialParams, ...any[]]) => any, PartialParams extends any[]> = F extends (
  ...params: [...PartialParams, ...infer RemainingParams]
) => infer Result
  ? (...params: RemainingParams) => Result
  : never;
