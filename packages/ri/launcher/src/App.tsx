import { observer } from "mobx-react-lite";
import React from "react";
import { Boot, Game, Info } from "./components";
import { useStore } from "./hooks";

export const App: React.FC = observer(() => {
  const store = useStore();

  return (
    <>
      <Info>
        <p>persona id: {store.personaId}</p>
      </Info>
      {store.instanceUrl ? <Game src={store.instanceUrl} /> : <Boot />}
    </>
  );
});
