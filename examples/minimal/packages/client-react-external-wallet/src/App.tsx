import { useMUDRead } from "./mud/read";
import { useMUDWrite } from "./mud/write";

export const App = () => {
  const { useStore, tables } = useMUDRead();
  const mudWrite = useMUDWrite();

  const counter = useStore((state) => state.getValue(tables.CounterTable, {}));

  return (
    <div>
      <div>Counter: {counter?.value ?? "unset"}</div>
      <div>
        {mudWrite && (
          <button type="button" onClick={() => mudWrite.systemCalls.increment()}>
            Increment
          </button>
        )}
      </div>
    </div>
  );
};
