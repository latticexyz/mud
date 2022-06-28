import React, { useState } from "react";
import {
  Layers,
  removeComponent,
  setComponent,
  Type,
  AnyComponent,
  Component,
  EntityIndex,
  Schema,
  World,
} from "@latticexyz/recs";
import { Collapse } from "react-collapse";
import { ComponentBrowserButton, EntityEditorContainer } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { ComponentEditor } from "./ComponentEditor";

export const EntityEditor = ({
  entity,
  components,
  layers,
  setContractComponentValue,
  devHighlightComponent,
  world,
}: {
  entity: EntityIndex;
  components: Set<AnyComponent>;
  layers: Layers;
  setContractComponentValue: SetContractComponentFunction<Schema>;
  devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
  world: World;
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <EntityEditorContainer
      onMouseEnter={() => {
        [...layers.phaser.world.entities.keys()].forEach((e) => removeComponent(devHighlightComponent, e as EntityIndex));
        setComponent(devHighlightComponent, entity, {
          value: null,
        });
      }}
      onMouseLeave={() => {
        removeComponent(devHighlightComponent, entity);
      }}
    >
      <div onClick={() => setOpened(!opened)} style={{ cursor: "pointer" }}>
        <h3 style={{ color: "white" }}>{world.entities[entity]}</h3>
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
};
