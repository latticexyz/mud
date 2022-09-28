import React, { useState } from "react";
import { Layers, Type, Component, Schema, World, EntityID } from "@latticexyz/recs";
import { BrowserContainer, SmallHeadline } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { EntityEditor } from "./EntityEditor";
import { QueryBuilder } from "./QueryBuilder";
import { useClearDevHighlights } from "./hooks";
import { observer } from "mobx-react-lite";
import { PrototypeCreator } from "./PrototypeCreator";
import { Coord } from "@latticexyz/phaserx";

/**
 * An Entity Browser for viewing/editiing Component values.
 */
export const Browser = observer(
  ({
    entities,
    layers,
    setContractComponentValue,
    devHighlightComponent,
    hoverHighlightComponent,
    prototypeComponent,
    nameComponent,
    spawnPrototypeAt,
    world,
  }: {
    entities: EntityID[];
    layers: Layers;
    setContractComponentValue: SetContractComponentFunction<Schema>;
    devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
    hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber }>;
    prototypeComponent?: Component<{ value: Type.StringArray }>;
    nameComponent?: Component<{ value: Type.String }>;
    spawnPrototypeAt?: (prototypeId: EntityID, position: Coord) => void;
    world: World;
  }) => {
    const [filteredEntities, setFilteredEntities] = useState<EntityID[]>([]);
    const [overflow, setOverflow] = useState(0);
    const clearDevHighlights = useClearDevHighlights(devHighlightComponent);

    return (
      <BrowserContainer>
        <QueryBuilder
          devHighlightComponent={devHighlightComponent}
          hoverHighlightComponent={hoverHighlightComponent}
          allEntities={entities}
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
