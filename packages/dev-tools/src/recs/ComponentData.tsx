import { useParams } from "react-router-dom";
import { useEntityQuery } from "@latticexyz/react";
import { useDevToolsContext } from "../DevToolsContext";
import { Has, getComponentValue } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { serialize } from "../serialize";

// TODO: use react-table or similar for better perf with lots of logs

export function ComponentData() {
  const { recsWorld: world } = useDevToolsContext();
  if (!world) throw new Error("Missing recsWorld");

  const { id: idParam } = useParams();
  const component = world.components.find((component) => component.id === idParam);

  // TODO: error message or redirect?
  if (!component) return null;

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
          // TODO: make component types more specific so we can decode entity
          // const key = decodeEntity(component.metadata.keySchema, entity);
          const value = getComponentValue(component, entity);
          return (
            <tr key={entity}>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{entity}</td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{serialize(value)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
