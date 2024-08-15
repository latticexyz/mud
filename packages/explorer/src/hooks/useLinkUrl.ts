import { useParams } from "next/navigation";

export function useLinkUrl() {
  const params = useParams();
  const { worldAddress } = params;
  return (page: string) => `/worlds/${worldAddress}/${page}`;
}
