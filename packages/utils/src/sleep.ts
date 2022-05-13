export function sleep<T>(timeout: number, returns?: T): Promise<T> {
  return new Promise<T>((resolve) => setTimeout(() => resolve(returns as T), timeout));
}
