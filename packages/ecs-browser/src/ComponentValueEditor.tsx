import React from "react";
import { AnyComponent, ComponentValue, EntityIndex, Schema, Layers } from "@latticexyz/recs";
import { SetContractComponentFunction } from "./types";
import { ValueEditor } from "./ValueEditor";

export const ComponentValueEditor = ({
  entity,
  component,
  componentValue,
  layers,
  setContractComponentValue,
}: {
  entity: EntityIndex;
  component: AnyComponent;
  componentValue: ComponentValue<Schema>;
  layers: Layers;
  setContractComponentValue: SetContractComponentFunction<Schema>;
}) => {
  return (
    <div>
      {Object.keys(componentValue).map((propName) => {
        return (
          <ValueEditor
            key={`value-editor-${propName}-${entity}`}
            entity={entity}
            component={component}
            componentValue={componentValue}
            valueProp={propName}
            layers={layers}
            setContractComponentValue={setContractComponentValue}
          />
        );
      })}
    </div>
  );
};
