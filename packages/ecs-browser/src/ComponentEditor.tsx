import React from "react";
import { getComponentValue, getComponentValueStrict, Layers, removeComponent } from "@latticexyz/recs";
import { AnyComponent, Entity, Schema } from "@latticexyz/recs/src/types";
import { observer } from "mobx-react-lite";
import { ComponentBrowserButton, ComponentEditorContainer, ComponentTitle } from "./StyledComponents";
import { ComponentValueEditor } from "./ComponentValueEditor";
import { hasContract, RemoveContractComponentFunction, SetContractComponentFunction } from "./types";

export const ComponentEditor = observer(
  ({
    entity,
    component,
    layers,
    setContractComponentValue,
    removeContractComponent
  }: {
    entity: Entity;
    component: AnyComponent;
    layers: Layers;
    setContractComponentValue: SetContractComponentFunction<Schema>;
    removeContractComponent: RemoveContractComponentFunction<Schema>;
  }) => {
    const componentValue = getComponentValue(component, entity);
    if(!componentValue) return <></>;

    const deleteComponent = (component: AnyComponent, entity: Entity) => {
      if(hasContract(component)) {
        removeContractComponent(entity, component);
      } else {
        removeComponent(component, entity)
      }
    };

    return (
      <ComponentEditorContainer>
        <ComponentTitle>
          {component.id}
          <ComponentBrowserButton onClick={() => deleteComponent(component, entity)}>Remove</ComponentBrowserButton>
        </ComponentTitle>
        <ComponentValueEditor
          entity={entity}
          component={component}
          componentValue={getComponentValueStrict(component, entity)}
          layers={layers}
          setContractComponentValue={setContractComponentValue}
        />
      </ComponentEditorContainer>
    );
  }
);
