import React, { useState } from "react";
import { Layers, Type } from "@latticexyz/recs";
import { AnyComponent, Component, Entity, Schema } from "@latticexyz/recs/src/types";
import { observer } from "mobx-react-lite";
import { BrowserContainer } from "./StyledComponents";
import { RemoveContractComponentFunction, SetContractComponentFunction } from "./types";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";

/**
 * An Entity Browser for viewing/editiing Component values.
 */
export const Browser = observer(
  ({
    entities,
    layers,
    setContractComponentValue,
    removeContractComponent,
    devHighlightComponent,
  }: {
    entities: [Entity, Set<AnyComponent>][];
    layers: Layers;
    setContractComponentValue: SetContractComponentFunction<Schema>;
    removeContractComponent: RemoveContractComponentFunction<Schema>;
    devHighlightComponent: Component<{ color: Type.OptionalNumber }>;
  }) => {
    const [filteredEntities, setFilteredEntities] = useState(entities);

    return (
      <BrowserContainer>
        <QueryBuilder devHighlightComponent={devHighlightComponent} allEntities={entities} setFilteredEntities={setFilteredEntities} layers={layers} />
        {filteredEntities.map(([entity, components]) => (
          <EntityEditor
            key={`entity-editor-${entity}`}
            entity={entity}
            components={components}
            layers={layers}
            setContractComponentValue={setContractComponentValue}
            removeContractComponent={removeContractComponent}
            devHighlightComponent={devHighlightComponent}
          />
        ))}
      </BrowserContainer>
    );
  }
);
