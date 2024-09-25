import { useParams } from "next/navigation";

export function useWorldUrl() {
  const params = useParams();
  const { chainName, worldAddress } = params;
  return (page: string) => `/${chainName}/worlds/${worldAddress}/${page}`;
}
