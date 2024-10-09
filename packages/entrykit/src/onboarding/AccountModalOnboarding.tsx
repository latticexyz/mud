import { useAccount } from "wagmi";
import { ConnectWallet } from "../content/ConnectWallet";
import { ConnectedWallet } from "../content/ConnectedWallet";
import { Steps } from "./Steps";
import { Step } from "./Step";
import { isPasskeyConnector } from "../passkey/isPasskeyConnector";
import { PasskeySteps } from "./PasskeySteps";

export function AccountModalOnboarding() {
  const userAccount = useAccount();

  if (userAccount.status !== "connected") {
    return <ConnectWallet />;
  }

  const isPasskey = isPasskeyConnector(userAccount.connector);
  console.log("isPasskey", isPasskey);
  return (
    <Steps>
      <Step id="connectWallet" label="Connect wallet" isComplete canComplete>
        <ConnectedWallet userAddress={userAccount.address} />
      </Step>
      {isPasskey ? (
        <PasskeySteps />
      ) : (
        <Step id="setupWallet" label="Set up" isComplete={false} canComplete={false}>
          TODO
        </Step>
      )}
    </Steps>
  );
}
