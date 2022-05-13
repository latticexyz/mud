import { IComputedValue, reaction } from "mobx";
import { deferred } from "./deferred";

/**
 * @param comp Computed/Observable value that is either defined or undefined
 * @returns promise that resolves with the first non-null computed value
 */
export async function awaitValue<T>(comp: IComputedValue<T | undefined>): Promise<T> {
  const [resolve, , promise] = deferred<T>();

  const dispose = reaction(
    () => comp.get(),
    (value) => {
      if (value) {
        resolve(value);
      }
    },
    { fireImmediately: true }
  );

  const value = await promise;
  // Dispose the reaction once the promise is resolved
  dispose();

  return value;
}
