import { useParams } from "next/navigation";

export function useWorldUrl() {
  const params = useParams();
  const { worldAddress } = params;
  return (page: string) => `/worlds/${worldAddress}${page}`;
}
