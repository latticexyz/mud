import { IComputedValue } from "mobx";
import { useEffect, useState } from "react";

// TODO: migrate the rest of the mobx stuff to rxjs

export const useDeprecatedComputedValue = <T>(computedValue: IComputedValue<T>) => {
  const [value, setValue] = useState<T>(computedValue.get());

  useEffect(() => {
    const unsubscribe = computedValue.observe_(() => setValue(computedValue.get()));
    return () => unsubscribe();
  }, [computedValue]);

  return value;
};
