import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { BulletinBoard } from "./components/BulletinBoard";

export function App() {
  const { isConnected } = useAccount();

  return (
    <>
      <h1>Bulletin Board</h1>

      <ConnectButton />

      {isConnected && <BulletinBoard />}
    </>
  );
}
