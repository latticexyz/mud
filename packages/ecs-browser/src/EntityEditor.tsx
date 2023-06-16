import React, { useEffect, useState } from "react";
import {
  Layers,
  setComponent,
  Type,
  AnyComponent,
  Component,
  Schema,
  World,
  getEntityComponents,
  Entity,
} from "@latticexyz/recs";
import { Collapse, ComponentBrowserButton, EntityEditorContainer } from "./StyledComponents";
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
    entityId: Entity;
    layers: Layers;
    setContractComponentValue?: SetContractComponentFunction<Schema>;
    devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
    world: World;
    clearDevHighlights: () => void;
  }) => {
    const [opened, setOpened] = useState(false);

    const [entityComponents, setEntityComponents] = useState<AnyComponent[]>([]);
    useEffect(() => {
      if (opened) {
        const components = getEntityComponents(world, entityId);
        setEntityComponents(components);
      }
    }, [opened, world, entityId, setEntityComponents]);

    return (
      <EntityEditorContainer
        onMouseEnter={() => {
          clearDevHighlights();
          setComponent(devHighlightComponent, entityId, {
            value: undefined,
          });
        }}
        onMouseLeave={() => clearDevHighlights()}
      >
        <div onClick={() => setOpened(!opened)} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <h3 style={{ color: "white" }}>Entity {entityId}</h3>
            <ComponentBrowserButton
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(entityId);
              }}
            >
              Click to copy Entity ID
            </ComponentBrowserButton>
          </div>
          <ComponentBrowserButton onClick={() => setOpened(!opened)}>
            {opened ? <>&#9660;</> : <>&#9654;</>}
          </ComponentBrowserButton>
        </div>
        <Collapse aria-hidden={opened ? "false" : "true"} opened={String(opened)}>
          {[...entityComponents.values()]
            .filter((c) => c.id !== devHighlightComponent.id)
            .map((c) => (
              <ComponentEditor
                key={`component-editor-${entityId}-${c.id}`}
                entity={entityId}
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
