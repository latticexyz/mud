# 6. Loading screen

MUD's networking stack comes with a client-side `LoadingState` component to track the client's progress in booting up the world: connecting to the network, downloading ECS state, etc.

We'll need to make sure all of the world state is loaded in before we move on, so let's add a loading screen.

```tsx !#1-3,7-16,20-24,26 packages/client/src/App.tsx
import { SyncState } from "@latticexyz/network";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { GameBoard } from "./GameBoard";

export const App = () => {
  const {
    components: { LoadingState },
    singletonEntity,
  } = useMUD();

  const loadingState = useComponentValue(LoadingState, singletonEntity, {
    state: SyncState.CONNECTING,
    msg: "Connecting",
    percentage: 0,
  });

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {loadingState.state !== SyncState.LIVE ? (
        <div>
          {loadingState.msg} ({Math.floor(loadingState.percentage)}%)
        </div>
      ) : (
        <GameBoard />
      )}
    </div>
  );
};
```
