import { observer } from "mobx-react-lite";
import React from "react";
import { Game, Info } from "./components";
import { useStore } from "./hooks";

export const App: React.FC = observer(() => {
  // [x] 1.   Connect wallet (for now just dev wallet)
  // [ ] 2.   Get persona
  // [x] 2.1  Mint persona if no persona is available
  // [ ] 3.   Get burner wallet for persona
  // [ ] 3.1  Create burner wallet if none is available
  // [ ] 3.2  Authorize burner wallet
  // [ ] 3.3  Impersonate persona with burner wallet
  // [ ] 4.   Construct URL and launch game
  const store = useStore();

  return (
    <>
      <Info>
        {/* <p>Connected wallet: {store.wallet?.address}</p> */}
        <p>persona id: {store.personaId}</p>
        {/* <p>Burner wallet: {store.burnerWallet?.address}</p> */}
      </Info>
      {store.instanceUrl && <Game src={store.instanceUrl}></Game>}
    </>
  );
});
