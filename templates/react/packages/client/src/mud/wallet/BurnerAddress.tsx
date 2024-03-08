import { useBurner } from "./BurnerContext";

export function BurnerAddress() {
  const burner = useBurner();

  if (!burner) return null;

  return <div>Burner wallet account: {burner.walletClient.account.address}</div>;
}
