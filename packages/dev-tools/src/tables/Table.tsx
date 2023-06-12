import { unpackTuple } from "@latticexyz/utils";
import { serializeWithoutIndexedValues } from "./serializeWithoutIndexedValues";
import { useParams } from "react-router-dom";
import { useStore } from "../useStore";
import { filter, distinctUntilChanged, map, of } from "rxjs";
import { useObservableValue } from "@latticexyz/react";

// TODO: use react-table or similar for better perf with lots of logs
// TODO: this will need refactoring once we have better v2 client code, for now we're leaning on v1 cache store (ECS based)

export function Table() {
  const cacheStore = useStore((state) => state.cacheStore);
  const { table } = useParams();

  // Rerender when we detect a change to the table
  const lastBlockNumber = useObservableValue(
    cacheStore
      ? cacheStore.componentUpdate$
          .pipe(filter(({ component }) => component == table))
          .pipe(map(({ blockNumber }) => blockNumber))
          .pipe(distinctUntilChanged())
      : of(0)
  );

  if (!cacheStore) return null;
  if (!table) return null;

  const componentIndex = cacheStore.components.indexOf(table);
  const cacheStoreKeys = Array.from(cacheStore.state.keys()).filter((key) => {
    const [component] = unpackTuple(key);
    return component === componentIndex;
  });

  // TODO: get fields and turn into columns instead of a single json value

  return (
    <table className="w-full table-fixed -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-left">
        <tr className="text-amber-200/80">
          <th className="px-1 pt-1.5 font-semibold uppercase text-xs w-3/12">key</th>
          <th className="px-1 pt-1.5 font-semibold uppercase text-xs">value</th>
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {cacheStoreKeys.map((key) => {
          const [_componentIndex, entityIndex] = unpackTuple(key);
          const entityId = cacheStore.entities[entityIndex];
          const value = cacheStore.state.get(key);
          return (
            <tr key={key}>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{entityId}</td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {serializeWithoutIndexedValues(value)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
