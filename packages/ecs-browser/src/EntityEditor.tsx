import React, { useEffect, useState } from "react";
import {
  Layers,
  setComponent,
  Type,
  AnyComponent,
  Component,
  Schema,
  World,
  EntityID,
  getEntityComponents,
} from "@latticexyz/recs";
import { Collapse } from "react-collapse";
import { ComponentBrowserButton, EntityEditorContainer } from "./StyledComponents";
import { SetContractComponentFunction } from "./types";
import { ComponentEditor } from "./ComponentEditor";
import { observer } from "mobx-react-lite";

export const EntityEditor = observer(
  ({
    entityId,
    layers,
    setContractComponentValue,
    devHighlightComponent,
    world,
    clearDevHighlights,
  }: {
    entityId: EntityID;
    layers: Layers;
    setContractComponentValue: SetContractComponentFunction<Schema>;
    devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
    world: World;
    clearDevHighlights: () => void;
  }) => {
    const [opened, setOpened] = useState(false);
    const entity = world.entityToIndex.get(entityId);
    if (!entity) return null;

    const [entityComponents, setEntityComponents] = useState<AnyComponent[]>([]);
    useEffect(() => {
      if (opened) {
        const components = getEntityComponents(world, entity);
        setEntityComponents(components);
      }
    }, [opened, world, entity, setEntityComponents]);

    return (
      <EntityEditorContainer
        onMouseEnter={() => {
          clearDevHighlights();
          setComponent(devHighlightComponent, entity, {
            value: null,
          });
        }}
      >
        <div onClick={() => setOpened(!opened)} style={{ cursor: "pointer" }}>
          <h3 style={{ color: "white" }}>{world.entities[entity]}</h3>
          <ComponentBrowserButton onClick={() => setOpened(!opened)}>
            {opened ? <>&#9660;</> : <>&#9654;</>}
          </ComponentBrowserButton>
        </div>
        <Collapse isOpened={opened}>
          {[...entityComponents.values()]
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
