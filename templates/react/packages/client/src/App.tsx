import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletClient } from "wagmi";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useSystemCalls } from "./mud/useSystemCalls";
import { useDelegationControl } from "./mud/useDelegationControl";

export const App = () => {
  const { network, components } = useMUD();
  console.log({ network, components });
  // TODO rename to delegatee
  const { walletClient: burnerWalletClient } = network;
  const { Counter } = components;

  const walletClient = useWalletClient();
  const systemCalls = useSystemCalls(network, components, walletClient.data);
  const delegationControlId = useDelegationControl(walletClient.data, burnerWalletClient, components);
  const counter = useComponentValue(Counter, singletonEntity);

  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          console.log("new counter value:", await systemCalls?.increment());
        }}
      >
        Increment
      </button>
      <ConnectButton />
      {walletClient.data && !delegationControlId ? (
        <button
          type="button"
          onClick={async (event) => {
            event.preventDefault();
            console.log("registering delegation");
            await systemCalls?.registerDelegation(burnerWalletClient.account.address);
          }}
        >
          Delegate actions to burner wallet: {burnerWalletClient.account.address}
        </button>
      ) : null}
    </>
  );
};
