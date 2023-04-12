import { IComputedValue } from "mobx";
import { useEffect, useState } from "react";

/** @deprecated See https://github.com/latticexyz/mud/issues/339 */
export const useDeprecatedComputedValue = <T>(computedValue: IComputedValue<T> & { observe_: any }) => {
  const [value, setValue] = useState<T>(computedValue.get());

  useEffect(() => {
    const unsubscribe = computedValue.observe_(() => setValue(computedValue.get()));
    return () => unsubscribe();
  }, [computedValue]);

  return value;
};
