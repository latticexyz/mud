import { useSearchParams } from "next/navigation";

export function useReadOnly() {
  const searchParams = useSearchParams();
  return searchParams.get("readonly") === "true";
}
