import { StaticPrimitiveType, DynamicPrimitiveType, isStaticAbiType, isDynamicAbiType } from "@latticexyz/schema-type";
import { concatHex } from "viem";
import { encodeField } from "./encodeField";
import { SchemaToPrimitives, ValueArgs, ValueSchema } from "./common";
import { encodeLengths } from "./encodeLengths";

export function encodeValueArgs<TSchema extends ValueSchema>(
  valueSchema: TSchema,
  value: SchemaToPrimitives<TSchema>
): ValueArgs {
  const staticFields = Object.values(valueSchema).filter(isStaticAbiType);
  const dynamicFields = Object.values(valueSchema).filter(isDynamicAbiType);

  const values = Object.values(value);
  const staticValues = values.slice(0, staticFields.length) as readonly StaticPrimitiveType[];
  const dynamicValues = values.slice(staticFields.length) as readonly DynamicPrimitiveType[];

  const encodedStaticValues = staticValues.map((value, i) => encodeField(staticFields[i], value));
  const encodedDynamicValues = dynamicValues.map((value, i) => encodeField(dynamicFields[i], value));
  const encodedLengths = encodeLengths(encodedDynamicValues);

  return {
    staticData: concatHex(encodedStaticValues),
    encodedLengths,
    dynamicData: concatHex(encodedDynamicValues),
  };
}
