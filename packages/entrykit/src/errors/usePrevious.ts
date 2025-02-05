import { useEffect, useRef } from "react";

// TODO: move to react or common package?
export function usePrevious<value, initialValue extends value | undefined>(
  value: value,
  initialValue?: initialValue,
): initialValue extends undefined ? value | undefined : value {
  const ref = useRef<{ value: value }>();
  useEffect(() => {
    ref.current = { value };
  }, [value]);
  return (ref.current ? ref.current.value : initialValue) as never;
}
