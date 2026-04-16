import { useParams } from "next/navigation";
import { Address } from "viem";
import { getWorldUrl } from "../utils/getWorldUrl";
import { useReadOnly } from "./useReadOnly";

export function useWorldUrl() {
  const isReadOnly = useReadOnly();
  const { chainName, worldAddress } = useParams();

  return (page: string) => {
    const baseUrl = `${getWorldUrl(chainName as string, worldAddress as Address)}/${page}`;
    return isReadOnly ? `${baseUrl}?${new URLSearchParams({ readonly: "true" })}` : baseUrl;
  };
}
