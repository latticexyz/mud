import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    components: { Counter },
    singletonEntity,
    worldSend,
  } = useMUD();

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

          const tx = await worldSend("increment", []);

          console.log("increment tx", tx);
          console.log("increment result", await tx.wait());
        }}
      >
        Increment
      </button>
    </>
  );
};
