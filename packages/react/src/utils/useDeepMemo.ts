import { useEffect, useState } from "react";
import isEqual from "fast-deep-equal";

export const useDeepMemo = <T>(currentValue: T): T => {
  const [stableValue, setStableValue] = useState(currentValue);

  useEffect(() => {
    if (!isEqual(currentValue, stableValue)) {
      setStableValue(currentValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return stableValue;
};
