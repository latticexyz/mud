import React, { useState } from "react";
import { Layers, Type, Component, Schema, World, EntityID } from "@latticexyz/recs";
import { BrowserContainer } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";

/**
 * An Entity Browser for viewing/editiing Component values.
 */
export const Browser = ({
  entities,
  layers,
  setContractComponentValue,
  devHighlightComponent,
  hoverHighlightComponent,
  world,
}: {
  entities: EntityID[];
  layers: Layers;
  setContractComponentValue: SetContractComponentFunction<Schema>;
  devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
  hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber; }>;
  world: World;
}) => {
  const [filteredEntities, setFilteredEntities] = useState<EntityID[]>([]);

  return (
    <BrowserContainer>
      <QueryBuilder
        devHighlightComponent={devHighlightComponent}
        hoverHighlightComponent={hoverHighlightComponent}
        allEntities={entities}
        setFilteredEntities={setFilteredEntities}
        layers={layers}
        world={world}
      />
      {filteredEntities.map((entity) => (
        <EntityEditor
          world={world}
          key={`entity-editor-${entity}`}
          entityId={entity}
          layers={layers}
          setContractComponentValue={setContractComponentValue}
          devHighlightComponent={devHighlightComponent}
        />
      ))}
    </BrowserContainer>
  );
};
