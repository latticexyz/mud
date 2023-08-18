import React from "react";
import { Layers, removeComponent } from "@latticexyz/recs";
import { AnyComponent, Entity, Schema } from "@latticexyz/recs/src/types";
import { ComponentBrowserButton, ComponentEditorContainer, ComponentTitle } from "./StyledComponents";
import { ComponentValueEditor } from "./ComponentValueEditor";
import { hasContract, SetContractComponentFunction } from "./types";
import { useComponentValueStream } from "@latticexyz/std-client/deprecated";

export const ComponentEditor = ({
  entity,
  component,
  layers,
  setContractComponentValue,
}: {
  entity: Entity;
  component: AnyComponent;
  layers: Layers;
  setContractComponentValue?: SetContractComponentFunction<Schema>;
}) => {
  const value = useComponentValueStream(component, entity);
  if (!value) return null;

  return (
    <ComponentEditorContainer>
      <ComponentTitle>
        {component.id}
        <ComponentBrowserButton
          onClick={() => {
            removeComponent(component, entity);

            if (setContractComponentValue && hasContract(component)) setContractComponentValue(entity, component, {});
          }}
        >
          Remove
        </ComponentBrowserButton>
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
