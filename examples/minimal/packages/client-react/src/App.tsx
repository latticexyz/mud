import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    components: { CounterTable },
    singletonEntity,
    worldSend,
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={async () => {
          const tx = await worldSend("increment", []);

          console.log("increment tx", tx);
          console.log("increment result", await tx.wait());
        }}
      >
        Increment
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          const tx = await worldSend("willRevert", []);

          console.log("willRevert tx", tx);
          console.log("willRevert result", await tx.wait());
        }}
      >
        Fail gas estimate
      </button>{" "}
      <button
        type="button"
        onClick={async () => {
          // set gas limit so we skip estimation and can test tx revert
          const tx = await worldSend("willRevert", [{ gasLimit: 100000 }]);

          console.log("willRevert tx", tx);
          console.log("willRevert result", await tx.wait());
        }}
      >
        Revert tx
      </button>
    </>
  );
};
