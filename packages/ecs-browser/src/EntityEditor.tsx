import React, { useState } from "react";
import { Layers, removeComponent, setComponent, Type } from "@latticexyz/recs";
import { AnyComponent, Component, Entity, Schema } from "@latticexyz/recs/src/types";
import { observer } from "mobx-react-lite";
import { Collapse } from "react-collapse";
import { ComponentBrowserButton, EntityEditorContainer } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { ComponentEditor } from "./ComponentEditor";

export const EntityEditor = observer(
  ({
    entity,
    components,
    layers,
    setContractComponentValue,
    devHighlightComponent,
  }: {
    entity: Entity;
    components: Set<AnyComponent>;
    layers: Layers;
    setContractComponentValue: SetContractComponentFunction<Schema>;
    devHighlightComponent: Component<{ color: Type.OptionalNumber }>;
  }) => {
    const [opened, setOpened] = useState(false);

    return (
      <EntityEditorContainer
        onMouseEnter={() => {
          [...layers.phaser.world.entities.keys()].forEach((e) => removeComponent(devHighlightComponent, e));
          setComponent(devHighlightComponent, entity, {
            color: null,
          });
        }}
        onMouseLeave={() => {
          removeComponent(devHighlightComponent, entity);
        }}
      >
        <div onClick={() => setOpened(!opened)} style={{ cursor: "pointer" }}>
          <h3 style={{ color: "white" }}>{entity}</h3>
          <ComponentBrowserButton onClick={() => setOpened(!opened)}>
            {opened ? <>&#9660;</> : <>&#9654;</>}
          </ComponentBrowserButton>
        </div>
        <Collapse isOpened={opened}>
          {[...components.values()]
            .filter((c) => c.id !== devHighlightComponent.id)
            .map((c) => (
              <ComponentEditor
                key={`component-editor-${entity}-${c.id}`}
                entity={entity}
                component={c}
                layers={layers}
                setContractComponentValue={setContractComponentValue}
              />
            ))}
        </Collapse>
      </EntityEditorContainer>
    );
  }
);
