import React, { useState } from "react";
import { Layers, Type, AnyComponent, Component, EntityIndex, Schema, World } from "@latticexyz/recs";
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
  world,
}: {
  entities: [EntityIndex, Set<AnyComponent>][];
  layers: Layers;
  setContractComponentValue: SetContractComponentFunction<Schema>;
  devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
  world: World;
}) => {
  const [filteredEntities, setFilteredEntities] = useState(entities);

  return (
    <BrowserContainer>
      <QueryBuilder
        devHighlightComponent={devHighlightComponent}
        allEntities={entities}
        setFilteredEntities={setFilteredEntities}
        layers={layers}
      />
      {filteredEntities.map(([entity, components]) => (
        <EntityEditor
          world={world}
          key={`entity-editor-${entity}`}
          entity={entity}
          components={components}
          layers={layers}
          setContractComponentValue={setContractComponentValue}
          devHighlightComponent={devHighlightComponent}
        />
      ))}
    </BrowserContainer>
  );
};
