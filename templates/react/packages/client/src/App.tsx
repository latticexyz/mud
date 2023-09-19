import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletClient } from "wagmi";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useSystemCalls } from "./mud/useSystemCalls";

export const App = () => {
  const { network, components } = useMUD();
  const { playerEntity, walletClient: burnerWalletClient } = network;
  const { Counter, Delegations } = components;

  const walletClient = useWalletClient();
  const systemCalls = useSystemCalls(network, components, walletClient.data);
  const counter = useComponentValue(Counter, singletonEntity);
  const delegatee = useComponentValue(Delegations, playerEntity);

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
      {walletClient.data && !delegatee ? (
        <button
          type="button"
          onClick={async (event) => {
            event.preventDefault();
            console.log("registering delegation");
            await systemCalls?.registerDelegation(walletClient.data.account.address);
          }}
        >
          Delegate actions to burner wallet: {burnerWalletClient.account.address}
        </button>
      ) : null}
    </>
  );
};
