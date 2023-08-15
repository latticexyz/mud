import { useParams } from "react-router-dom";
import { useDevToolsContext } from "../DevToolsContext";
import { ComponentDataTable } from "./ComponentDataTable";
import { isStoreComponent } from "@latticexyz/store-sync/recs";
import { StoreComponentDataTable } from "./StoreComponentDataTable";

// TODO: use react-table or similar for better perf with lots of logs

export function ComponentData() {
  const { recsWorld: world } = useDevToolsContext();
  if (!world) throw new Error("Missing recsWorld");

  const { id: idParam } = useParams();
  const component = world.components.find((component) => component.id === idParam);

  // TODO: error message or redirect?
  if (!component) return null;

  // key here is useful to force a re-render on component changes,
  // otherwise state hangs around from previous render during navigation (entities)
  return isStoreComponent(component) ? (
    <StoreComponentDataTable key={component.id} component={component} />
  ) : (
    <ComponentDataTable key={component.id} component={component} />
  );
}
