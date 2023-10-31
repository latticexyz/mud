import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    network: { tables, useStore },
    systemCalls: { increment },
  } = useMUD();

  const counter = useStore((state) => state.getValue(tables.Counter, {}));

  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          console.log("new counter value:", await increment());
        }}
      >
        Increment
      </button>
    </>
  );
};
