import { useMUD } from "./MUDContext";

export const App = () => {
  const {
    network: { tables, useStore },
    systemCalls: { increment },
  } = useMUD();

  const counter = useStore((state) => state.getValue(tables.CounterTable, {}));

  return (
    <div>
      Counter: {counter?.value ?? "unset"}
      <br />
      <button type="button" onClick={increment}>
        Increment
      </button>
    </div>
  );
};
