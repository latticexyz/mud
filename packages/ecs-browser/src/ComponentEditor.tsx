import React from "react";
import { getComponentValue, Layers, removeComponent } from "@latticexyz/recs";
import { AnyComponent, Entity, Schema } from "@latticexyz/recs/src/types";
import { observer } from "mobx-react-lite";
import { ComponentBrowserButton, ComponentEditorContainer, ComponentTitle } from "./StyledComponents";
import { ComponentValueEditor } from "./ComponentValueEditor";
import { SetContractComponentFunction } from "./types";

export const ComponentEditor = observer(
  ({
    entity,
    component,
    layers,
    setContractComponentValue,
  }: {
    entity: Entity;
    component: AnyComponent;
    layers: Layers;
    setContractComponentValue: SetContractComponentFunction<Schema>;
  }) => {
    const componentValue = getComponentValue(component, entity);
    if(!componentValue) return <></>;

    return (
      <ComponentEditorContainer>
        <ComponentTitle>
          {component.id}
          <ComponentBrowserButton onClick={() => removeComponent(component, entity)}>Remove</ComponentBrowserButton>
        </ComponentTitle>
        <ComponentValueEditor
          entity={entity}
          component={component}
          componentValue={componentValue}
          layers={layers}
          setContractComponentValue={setContractComponentValue}
        />
      </ComponentEditorContainer>
    );
  }
);
