import React from "react";
import { Layers } from "@latticexyz/recs";
import { AnyComponent, ComponentValue, Entity, Schema } from "@latticexyz/recs/src/types";
import { observer } from "mobx-react-lite";
import { SetContractComponentFunction } from "./types";
import { ValueEditor } from "./ValueEditor";

export const ComponentValueEditor = observer(
  ({
    entity,
    component,
    componentValue,
    layers,
    setContractComponentValue,
  }: {
    entity: Entity;
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
  }
);
