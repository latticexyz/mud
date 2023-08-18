import { useEntityQuery } from "@latticexyz/react";
import { Component, Has, Schema, getComponentValueStrict } from "@latticexyz/recs";
import { StoreComponentMetadata, decodeEntity } from "@latticexyz/store-sync/recs";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  component: Component<Schema, StoreComponentMetadata>;
};

export function StoreComponentDataTable({ component }: Props) {
  // TODO: this breaks when navigating because its state still has entity IDs from prev page
  const entities = useEntityQuery([Has(component)]);

  return (
    <table className="w-full -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-left">
        <tr className="text-amber-200/80 font-mono">
          {Object.keys(component.metadata.keySchema).map((name) => (
            <th key={name} className="px-1 pt-1.5 font-normal">
              {name}
            </th>
          ))}
          {Object.keys(component.metadata.valueSchema).map((name) => (
            <th key={name} className="px-1 pt-1.5 font-normal">
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {entities.map((entity) => {
          const key = decodeEntity(component.metadata.keySchema, entity);
          const value = getComponentValueStrict(component, entity);
          return (
            <tr key={entity}>
              {Object.keys(component.metadata.keySchema).map((name) => (
                <td key={name} className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {String(key[name])}
                </td>
              ))}
              {Object.keys(component.metadata.valueSchema).map((name) => {
                const fieldValue = value[name];
                return (
                  <td key={name} className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {Array.isArray(fieldValue) ? fieldValue.map(String).join(", ") : String(fieldValue)}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
