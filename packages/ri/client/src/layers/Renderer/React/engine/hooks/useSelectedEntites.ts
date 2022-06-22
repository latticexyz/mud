import { Has, runQuery } from "@latticexyz/recs";
import { useLayers } from "./useLayers";

export function useSelectedEntities() {
  const {
    local: {
      components: { Selected },
    },
  } = useLayers();

  return runQuery([Has(Selected)]);
}
