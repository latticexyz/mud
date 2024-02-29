import { useEntityQuery } from "@latticexyz/react";
import { Component, Has, getComponentValueStrict, Type } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { serialize } from "../serialize";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  component: Component;
};

export function ComponentDataTable({ component }: Props) {
  // TODO: this breaks when navigating because its state still has entity IDs from prev page
  const entities = useEntityQuery([Has(component)]);

  return (
    <table className="w-full -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-left">
        <tr className="text-amber-200/80 font-mono">
          <th className="px-1 pt-1.5 font-normal">entity</th>
          {Object.keys(component.schema).map((name) => (
            <th key={name} className="px-1 pt-1.5 font-normal">
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {entities.map((entity) => {
          const value = getComponentValueStrict(component, entity);
          return (
            <tr key={entity}>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{entity}</td>
              {Object.keys(component.schema).map((name) => {
                const fieldValue = value[name];
                return (
                  <td key={name} className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {component.schema[name] === Type.T
                      ? serialize(fieldValue)
                      : Array.isArray(fieldValue)
                      ? fieldValue.map(String).join(", ")
                      : String(fieldValue)}
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
