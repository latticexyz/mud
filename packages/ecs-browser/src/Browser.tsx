import React, { useState } from "react";
import { Layers, Type, Component, Schema, World, Entity } from "@latticexyz/recs";
import { BrowserContainer, SmallHeadline } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";
import { useClearDevHighlights } from "./hooks";
import { observer } from "mobx-react-lite";
import { Coord } from "./shared";
import { createBrowserDevComponents } from "./createBrowserDevComponents";

/**
 * An Entity Browser for viewing/editiing Component values.
 */
export const Browser = observer(
  ({
    layers,
    setContractComponentValue,
    world,
    devHighlightComponent,
  }: {
    layers: Layers;
    setContractComponentValue?: SetContractComponentFunction<Schema>;
    prototypeComponent?: Component<{ value: Type.StringArray }>;
    nameComponent?: Component<{ value: Type.String }>;
    spawnPrototypeAt?: (prototypeId: Entity, position: Coord) => void;
    world: World;
    devHighlightComponent: ReturnType<typeof createBrowserDevComponents>["devHighlightComponent"];
    hoverHighlightComponent: ReturnType<typeof createBrowserDevComponents>["hoverHighlightComponent"];
  }) => {
    const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
    const [overflow, setOverflow] = useState(0);
    const clearDevHighlights = useClearDevHighlights(devHighlightComponent);

    return (
      <BrowserContainer>
        <QueryBuilder
          devHighlightComponent={devHighlightComponent}
          allEntities={[...world.getEntities()]}
          setFilteredEntities={setFilteredEntities}
          layers={layers}
          world={world}
          clearDevHighlights={clearDevHighlights}
          setOverflow={setOverflow}
        />
        <SmallHeadline>
          Showing {filteredEntities.length} of {filteredEntities.length + overflow} entities
        </SmallHeadline>
        {filteredEntities.map((entity) => (
          <EntityEditor
            world={world}
            key={`entity-editor-${entity}`}
            entityId={entity}
            layers={layers}
            setContractComponentValue={setContractComponentValue}
            devHighlightComponent={devHighlightComponent}
            clearDevHighlights={clearDevHighlights}
          />
        ))}
      </BrowserContainer>
    );
  }
);
