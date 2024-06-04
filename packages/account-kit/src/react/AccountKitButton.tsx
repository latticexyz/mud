import { useEffect, useRef } from "react";
import { useAccountKitInstance } from "./AccountKitProvider";

export function AccountKitButton() {
  const accountKit = useAccountKitInstance();
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      return accountKit.mountButton({ container: ref.current, ignoreMountWarning: true });
    }
  }, [accountKit]);
  return <span ref={ref} />;
}
