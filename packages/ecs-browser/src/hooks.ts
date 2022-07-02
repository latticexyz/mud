import { Component, defineQuery, EntityIndex, Has, removeComponent } from "@latticexyz/recs";
import { ObservableSet } from "mobx";
import { useCallback, useEffect, useRef } from "react";

export function useClearDevHighlights(devHighlightComponent: Component) {
  const highlightedEntities = useRef<ObservableSet<EntityIndex>>();

  useEffect(() => {
    const queryResult = defineQuery([Has(devHighlightComponent)], { runOnInit: true });
    const subscription = queryResult.update$.subscribe();
    highlightedEntities.current = queryResult.matching;
    return () => subscription?.unsubscribe();
  }, []);

  return useCallback(() => {
    if (!highlightedEntities.current) return;
    for (const entity of highlightedEntities.current) {
      removeComponent(devHighlightComponent, entity);
    }
  }, [highlightedEntities]);
}
