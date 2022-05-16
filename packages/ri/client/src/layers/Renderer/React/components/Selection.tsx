import React from "react";
import { registerUIComponent } from "../engine";
import { setPreviewEntity } from "../engine/store";

export function registerSelection() {
  registerUIComponent(
    "Selection",
    (layers, selectedEntities) => (selectedEntities.size > 1 ? { layers, selectedEntities } : null),
    ({ layers, selectedEntities }) => {
      const { selectEntity, resetSelection } = layers.local.api;

      return (
        <>
          Selection:{" "}
          {[...selectedEntities].map((entity) => (
            <p
              key={`selection-${entity}`}
              onClick={() => {
                resetSelection();
                selectEntity(entity);
                setPreviewEntity(undefined);
              }}
              onMouseEnter={() => setPreviewEntity(entity)}
              onMouseLeave={() => setPreviewEntity(undefined)}
            >
              {entity}
            </p>
          ))}
        </>
      );
    }
  );
}
