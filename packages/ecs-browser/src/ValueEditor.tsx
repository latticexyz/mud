import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getComponentValueStrict, Layers, Type, updateComponent } from "@latticexyz/recs";
import {
  AnyComponent,
  ComponentValue,
  EntityIndex,
  isArrayType,
  isEntityType,
  isNumberType,
  isOptionalType,
  Schema,
} from "@latticexyz/recs";
import { startCase } from "lodash";
import { ComponentBrowserInput, ComponentBrowserSelect, ValueForm } from "./StyledComponents";
import { DraggableNumberLabel } from "./DraggableNumberLabel";
import { hasContract, SetContractComponentFunction } from "./types";

export const ValueEditor = ({
  entity,
  component,
  componentValue,
  valueProp,
  layers,
  setContractComponentValue,
}: {
  entity: EntityIndex;
  component: AnyComponent;
  componentValue: ComponentValue<Schema>;
  valueProp: string;
  layers: Layers;
  setContractComponentValue?: SetContractComponentFunction<Schema>;
}) => {
  const [value, setValue] = useState<string | null>(componentValue[valueProp]?.toString() as string | null);

  useEffect(() => {
    const v = componentValue[valueProp];
    setValue(v as string | null);
  }, [componentValue, valueProp]);

  const inputType = useMemo(() => {
    const type = component.schema[valueProp];
    if (isNumberType(type)) {
      return "number";
    } else if (isEntityType(type)) {
      return "select";
    } else {
      return "text";
    }
  }, [component, valueProp]);

  const persistValue = useCallback(
    (e: Event | React.SyntheticEvent, value: string | null) => {
      e.preventDefault();

      if (!setContractComponentValue) {
        return;
      }

      const valueType = component.schema[valueProp];

      if (value == null || value === "") {
        if (isOptionalType(valueType)) {
          updateComponent(component, entity, { [valueProp]: undefined });
          return;
        }

        const currentValue = getComponentValueStrict(component, entity);
        setValue(currentValue[valueProp] as string);
        return;
      }

      let parsedValue;
      if (isNumberType(valueType)) {
        parsedValue = parseInt(value);
      } else if (isArrayType(valueType)) {
        parsedValue = value.split(",");
      } else if (valueType === Type.Boolean) {
        parsedValue = value === "true";
      } else {
        parsedValue = value;
      }

      if (hasContract(component)) {
        const currentValue = getComponentValueStrict(component, entity);
        setContractComponentValue(entity, component, {
          ...currentValue,
          [valueProp]: parsedValue,
        });
      } else {
        updateComponent(component, entity, { [valueProp]: parsedValue });
      }
    },
    [entity, component, valueProp, layers, inputType]
  );

  return (
    <ValueForm onSubmit={(e) => persistValue(e, value)}>
      {isNumberType(component.schema[valueProp]) && setContractComponentValue ? (
        <DraggableNumberLabel
          value={value}
          setValue={setValue}
          persistValue={persistValue}
          label={`${startCase(valueProp)}:`}
        />
      ) : (
        <label style={{ cursor: "pointer" }} htmlFor={`value-${valueProp}`}>
          {startCase(valueProp)}:
        </label>
      )}
      {inputType === "select" ? (
        <ComponentBrowserSelect
          value={value ?? ""}
          onChange={(e) => {
            setValue(e.target.value);
            persistValue(e, e.target.value);
          }}
          disabled={!setContractComponentValue}
        >
          <option value="">None</option>
          {Object.values(layers)[0].world.entities.map((entityId) => (
            <option key={entityId} value={entityId}>
              {entityId}
            </option>
          ))}
        </ComponentBrowserSelect>
      ) : (
        <ComponentBrowserInput
          id={`value-${valueProp}`}
          name={`value-${valueProp}`}
          type={inputType}
          value={value ?? ""}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onBlur={(e) => persistValue(e, value)}
          disabled={!setContractComponentValue}
        />
      )}
    </ValueForm>
  );
};
