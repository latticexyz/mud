import { useSearchParams } from "next/navigation";
import { Hex } from "viem";

export const useWorldAddress = () => {
  const searchParams = useSearchParams();
  const worldAddress = searchParams.get("worldAddress") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;
  return worldAddress as Hex;
};
