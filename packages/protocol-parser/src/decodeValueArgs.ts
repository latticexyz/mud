import { concatHex, padHex } from "viem";
import { isStaticAbiType } from "@latticexyz/schema-type/internal";
import { SchemaToPrimitives, ValueArgs, ValueSchema } from "./common";
import { decodeValue } from "./decodeValue";
import { staticDataLength } from "./staticDataLength";
import { readHex } from "@latticexyz/common";

export function decodeValueArgs<TSchema extends ValueSchema>(
  valueSchema: TSchema,
  { staticData, encodedLengths, dynamicData }: ValueArgs,
): SchemaToPrimitives<TSchema> {
  return decodeValue(
    valueSchema,
    concatHex([
      readHex(staticData, 0, staticDataLength(Object.values(valueSchema).filter(isStaticAbiType))),
      padHex(encodedLengths, { size: 32 }),
      dynamicData,
    ]),
  );
}
