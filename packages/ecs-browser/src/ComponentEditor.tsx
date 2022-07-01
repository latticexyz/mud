import React from "react";
import { Layers, removeComponent, toUpdate } from "@latticexyz/recs";
import { AnyComponent, EntityIndex, Schema } from "@latticexyz/recs/src/types";
import { ComponentBrowserButton, ComponentEditorContainer, ComponentTitle } from "./StyledComponents";
import { ComponentValueEditor } from "./ComponentValueEditor";
import { SetContractComponentFunction } from "./types";
import { useStream } from "@latticexyz/std-client";

export const ComponentEditor = ({
  entity,
  component,
  layers,
  setContractComponentValue,
}: {
  entity: EntityIndex;
  component: AnyComponent;
  layers: Layers;
  setContractComponentValue: SetContractComponentFunction<Schema>;
}) => {
  const componentUpdate = useStream(component.update$, toUpdate(entity, component));
  if(!componentUpdate) return null;
  
  const value = componentUpdate.value[0];
  if(!value) return null;

  return (
    <ComponentEditorContainer>
      <ComponentTitle>
        {component.id}
        <ComponentBrowserButton onClick={() => removeComponent(component, entity)}>Remove</ComponentBrowserButton>
      </ComponentTitle>
      <ComponentValueEditor
        entity={entity}
        component={component}
        componentValue={value}
        layers={layers}
        setContractComponentValue={setContractComponentValue}
      />
    </ComponentEditorContainer>
  );
};
