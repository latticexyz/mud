import React, { useState } from "react";
import { Layers, Type, Component, Schema, World, EntityID } from "@latticexyz/recs";
import { BrowserContainer, SmallHeadline } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";
import { useClearDevHighlights } from "./hooks";
import { observer } from "mobx-react-lite";
import { PrototypeCreator } from "./PrototypeCreator";
import { Coord } from "./shared";
import { createBrowserDevComponents } from "./createBrowserDevComponents";

/**
 * An Entity Browser for viewing/editiing Component values.
 */
export const Browser = observer(
  ({
    layers,
    setContractComponentValue,
    prototypeComponent,
    nameComponent,
    spawnPrototypeAt,
    world,
    devHighlightComponent,
    hoverHighlightComponent,
  }: {
    layers: Layers;
    setContractComponentValue?: SetContractComponentFunction<Schema>;
    prototypeComponent?: Component<{ value: Type.StringArray }>;
    nameComponent?: Component<{ value: Type.String }>;
    spawnPrototypeAt?: (prototypeId: EntityID, position: Coord) => void;
    world: World;
    devHighlightComponent: ReturnType<typeof createBrowserDevComponents>["devHighlightComponent"];
    hoverHighlightComponent: ReturnType<typeof createBrowserDevComponents>["hoverHighlightComponent"];
  }) => {
    const [filteredEntities, setFilteredEntities] = useState<EntityID[]>([]);
    const [overflow, setOverflow] = useState(0);
    const clearDevHighlights = useClearDevHighlights(devHighlightComponent);

    return (
      <BrowserContainer>
        <QueryBuilder
          devHighlightComponent={devHighlightComponent}
          allEntities={world.entities}
          setFilteredEntities={setFilteredEntities}
          layers={layers}
          world={world}
          clearDevHighlights={clearDevHighlights}
          setOverflow={setOverflow}
        />
        {hoverHighlightComponent && prototypeComponent && spawnPrototypeAt && nameComponent && (
          <PrototypeCreator
            layers={layers}
            hoverHighlightComponent={hoverHighlightComponent}
            prototypeComponent={prototypeComponent}
            nameComponent={nameComponent}
            spawnPrototypeAt={spawnPrototypeAt}
          />
        )}
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
