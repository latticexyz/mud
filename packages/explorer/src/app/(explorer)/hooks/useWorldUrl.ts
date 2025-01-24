import { useParams } from "next/navigation";
import { Address } from "viem";
import { getWorldUrl } from "../utils/getWorldUrl";

export function useWorldUrl() {
  const params = useParams();
  const { chainName, worldAddress } = params;
  return (page: string) => `${getWorldUrl(chainName as string, worldAddress as Address)}/${page}`;
}
