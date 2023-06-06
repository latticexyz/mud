import { DynamicAbiType, dynamicAbiTypeToDefaultValue, dynamicAbiTypes } from "./dynamicAbiTypes";
import { StaticAbiType, staticAbiTypeToDefaultValue, staticAbiTypes } from "./staticAbiTypes";

export const abiTypes = [...staticAbiTypes, ...dynamicAbiTypes] as const;

export type AbiType = (typeof abiTypes)[number];

export const abiTypeToDefaultValue = {
  ...staticAbiTypeToDefaultValue,
  ...dynamicAbiTypeToDefaultValue,
} as const satisfies Record<
  AbiType,
  (typeof staticAbiTypeToDefaultValue)[StaticAbiType] | (typeof dynamicAbiTypeToDefaultValue)[DynamicAbiType]
>;
