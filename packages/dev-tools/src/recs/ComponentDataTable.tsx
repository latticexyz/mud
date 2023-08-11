import { useEntityQuery } from "@latticexyz/react";
import { Component, Has, Schema, getComponentValue } from "@latticexyz/recs";
import { StoreComponentMetadata, decodeEntity } from "@latticexyz/store-sync/recs";
import { serialize } from "../serialize";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  component: Component<Schema, StoreComponentMetadata>;
};

export function ComponentDataTable({ component }: Props) {
  // TODO: this breaks when navigating because its state still has entity IDs from prev page
  const entities = useEntityQuery([Has(component)]);

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
        {entities.map((entity) => {
          const key = decodeEntity(component.metadata.keySchema, entity);
          const value = getComponentValue(component, entity);
          return (
            <tr key={entity}>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{serialize(key)}</td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{serialize(value)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
