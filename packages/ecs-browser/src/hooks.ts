import { Component, Has, removeComponent } from "@latticexyz/recs";
import { useQuery } from "@latticexyz/std-client";
import { useCallback } from "react";

export function useClearDevHighlights(devHighlightComponent: Component) {
  const highlightedEntities = useQuery([Has(devHighlightComponent)]);

  return useCallback(() => {
    if (!highlightedEntities) return;
    for (const entity of highlightedEntities) {
      removeComponent(devHighlightComponent, entity);
    }
  }, [highlightedEntities]);
}
