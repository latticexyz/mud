import { defineQuery, Has } from "@mud/recs";
import { useLayers } from "./useLayers";

export function useSelectedEntities() {
  const {
    local: {
      components: { Selected },
    },
  } = useLayers();

  return defineQuery([Has(Selected)]).get();
}
