import { useParams } from "react-router-dom";
import { useDevToolsContext } from "../DevToolsContext";
import { ComponentDataTable } from "./ComponentDataTable";
import { isStoreComponent } from "@latticexyz/store-sync/recs";

// TODO: use react-table or similar for better perf with lots of logs

export function ComponentData() {
  const { recsWorld: world } = useDevToolsContext();
  if (!world) throw new Error("Missing recsWorld");

  const { id: idParam } = useParams();
  const component = world.components.find((component) => component.id === idParam);

  // TODO: error message or redirect?
  if (!component || !isStoreComponent(component)) return null;

  // key here is useful to force a re-render on component changes,
  // otherwise state hangs around from previous render during navigation (entities)
  return <ComponentDataTable key={component.id} component={component} />;
}
