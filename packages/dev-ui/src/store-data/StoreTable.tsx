import { CacheStore } from "@latticexyz/network";
import { isDefined, unpackTuple } from "@latticexyz/utils";
import { serialize } from "../serialize";
import { serializeWithoutIndexedValues } from "./serializeWithoutIndexedValues";

// TODO: use react-table or similar for better perf with lots of logs
// TODO: this will need refactoring once we have better v2 client code, for now we're leaning on v1 cache store (ECS based)

type Props = {
  cacheStore: CacheStore;
  component: string;
};

export function StoreTable({ cacheStore, component }: Props) {
  const componentIndex = cacheStore.components.indexOf(component);
  const cacheStoreKeys = Array.from(cacheStore.state.keys()).filter((key) => {
    const [component, entity] = unpackTuple(key);
    return component === componentIndex;
  });

  return (
    <table className="w-full table-fixed -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-left">
        <tr className="text-amber-200/80">
          <th className="px-1 pt-1.5 font-semibold uppercase text-xs w-2/12">key</th>
          <th className="px-1 pt-1.5 font-semibold uppercase text-xs">value</th>
        </tr>
        {/* I want the table name to go first, but the colspan mucks with the fixed table size, so putting it here for now */}
        <tr>
          <th colSpan={2} className="px-1 pb-0.5 font-mono font-normal">
            {component}
          </th>
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
                {serializeWithoutIndexedValues(cacheStore.state.get(key))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
