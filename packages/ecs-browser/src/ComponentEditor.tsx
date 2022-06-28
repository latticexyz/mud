import React from "react";
import { getComponentValue, Layers, removeComponent } from "@latticexyz/recs";
import { AnyComponent, EntityIndex, Schema } from "@latticexyz/recs/src/types";
import { ComponentBrowserButton, ComponentEditorContainer, ComponentTitle } from "./StyledComponents";
import { ComponentValueEditor } from "./ComponentValueEditor";
import { SetContractComponentFunction } from "./types";

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
  const currentValue = getComponentValue(component, entity);
  if (!currentValue) return <></>;

  return (
    <ComponentEditorContainer>
      <ComponentTitle>
        {component.id}
        <ComponentBrowserButton onClick={() => removeComponent(component, entity)}>Remove</ComponentBrowserButton>
      </ComponentTitle>
      <ComponentValueEditor
        entity={entity}
        component={component}
        componentValue={currentValue}
        layers={layers}
        setContractComponentValue={setContractComponentValue}
      />
    </ComponentEditorContainer>
  );
};
