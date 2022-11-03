import { Component, EntityID, getComponentValue, Has, Layers, Type } from "@latticexyz/recs";
import React, { useEffect, useState } from "react";
import { ComponentBrowserButton, ComponentBrowserSelect } from "../StyledComponents";
import { Coord } from "../shared";
import { useComponentValueStream, useQuery } from "@latticexyz/std-client";

export const PrototypeCreator: React.FC<{
  layers: Layers;
  spawnPrototypeAt: (prototypeId: EntityID, position: Coord) => void;
  prototypeComponent: Component<{ value: Type.StringArray }>;
  nameComponent: Component<{ value: Type.String }>;
  hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber }>;
}> = ({ layers, prototypeComponent, nameComponent, hoverHighlightComponent, spawnPrototypeAt }) => {
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectedPrototype, setSelectedPrototype] = useState<string | undefined>(undefined);
  const hoverHighlight = useComponentValueStream(hoverHighlightComponent);

  const prototypes = useQuery([Has(prototypeComponent)]);

  useEffect(() => {
    if (!selectingPosition) return;

    function onMouseDown() {
      if (!hoverHighlight) return;
      if (hoverHighlight.x == null || hoverHighlight.y == null) return;

      setSelectingPosition(false);
      spawnPrototypeAt(selectedPrototype as EntityID, { x: hoverHighlight.x, y: hoverHighlight.y });
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [selectingPosition, hoverHighlight]);

  if (!prototypes) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <ComponentBrowserSelect
        style={{ margin: "8px auto" }}
        value={selectedPrototype}
        onChange={(e) => {
          setSelectedPrototype(e.target.value);
        }}
      >
        <option value="">None</option>
        {[...prototypes].map((entityIndex) => {
          const entityId = layers.network.world.entities[entityIndex];
          const name = getComponentValue(nameComponent, entityIndex)?.value;
          return (
            <option key={entityId} value={entityId}>
              {name || entityId}
            </option>
          );
        })}
      </ComponentBrowserSelect>
      <ComponentBrowserButton
        style={{ margin: "8px auto" }}
        active={selectingPosition}
        onClick={() => {
          setSelectingPosition(true);
        }}
      >
        {selectingPosition
          ? `Spawn prototype at (${hoverHighlight?.x}, ${hoverHighlight?.y})`
          : "Begin spawning prototype"}
      </ComponentBrowserButton>
    </div>
  );
};
