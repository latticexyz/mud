import {
  StaticPrimitiveType,
  DynamicPrimitiveType,
  isStaticAbiType,
  isDynamicAbiType,
  StaticAbiType,
  DynamicAbiType,
} from "@latticexyz/schema-type";
import { concatHex } from "viem";
import { encodeField } from "./encodeField";
import { SchemaToPrimitives, ValueArgs, ValueSchema } from "./common";
import { encodeLengths } from "./encodeLengths";

export function encodeValueArgs<TSchema extends ValueSchema>(
  valueSchema: TSchema,
  value: SchemaToPrimitives<TSchema>
): ValueArgs {
  const valueSchemaEntries = Object.entries(valueSchema);
  const staticFields = valueSchemaEntries.filter(([, type]) => isStaticAbiType(type)) as [string, StaticAbiType][];
  const dynamicFields = valueSchemaEntries.filter(([, type]) => isDynamicAbiType(type)) as [string, DynamicAbiType][];
  // TODO: validate <=5 dynamic fields
  // TODO: validate <=28 total fields

  const encodedStaticValues = staticFields.map(([name, type]) => encodeField(type, value[name] as StaticPrimitiveType));
  const encodedDynamicValues = dynamicFields.map(([name, type]) =>
    encodeField(type, value[name] as DynamicPrimitiveType)
  );

  const encodedLengths = encodeLengths(encodedDynamicValues);

  return {
    staticData: concatHex(encodedStaticValues),
    encodedLengths,
    dynamicData: concatHex(encodedDynamicValues),
  };
}
