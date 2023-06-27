import {
  StaticPrimitiveType,
  DynamicPrimitiveType,
  staticAbiTypeToByteLength,
  DynamicAbiType,
  StaticAbiType,
  schemaAbiTypes,
} from "@latticexyz/schema-type";
import { Hex, hexToNumber, sliceHex } from "viem";
import { decodeDynamicField } from "./decodeDynamicField";
import { decodeStaticField } from "./decodeStaticField";
import { hexToPackedCounter } from "./hexToPackedCounter";
import { InvalidHexLengthForSchemaError, SchemaStaticLengthMismatchError } from "./errors";

export class Schema {
  readonly staticFields: readonly StaticAbiType[];
  readonly dynamicFields: readonly DynamicAbiType[];

  constructor(staticFields: readonly StaticAbiType[], dynamicFields: readonly DynamicAbiType[] = []) {
    // TODO: validate at least one static field
    // TODO: validate that static fields and dynamic fields are part of the possible abi types
    this.staticFields = staticFields;
    this.dynamicFields = dynamicFields;
    Object.freeze(this);
  }

  static fromHex(data: Hex): Schema {
    if (data.length !== 66) {
      throw new InvalidHexLengthForSchemaError(data);
    }

    const staticDataLength = hexToNumber(sliceHex(data, 0, 2));
    const numStaticFields = hexToNumber(sliceHex(data, 2, 3));
    const numDynamicFields = hexToNumber(sliceHex(data, 3, 4));
    const staticFields: StaticAbiType[] = [];
    const dynamicFields: DynamicAbiType[] = [];

    for (let i = 4; i < 4 + numStaticFields; i++) {
      const schemaTypeIndex = hexToNumber(sliceHex(data, i, i + 1));
      staticFields.push(schemaAbiTypes[schemaTypeIndex] as StaticAbiType);
    }
    for (let i = 4 + numStaticFields; i < 4 + numStaticFields + numDynamicFields; i++) {
      const schemaTypeIndex = hexToNumber(sliceHex(data, i, i + 1));
      dynamicFields.push(schemaAbiTypes[schemaTypeIndex] as DynamicAbiType);
    }

    // validate static data length
    const actualStaticDataLength = staticFields.reduce(
      (acc, fieldType) => acc + staticAbiTypeToByteLength[fieldType],
      0
    );
    if (actualStaticDataLength !== staticDataLength) {
      throw new SchemaStaticLengthMismatchError(data, staticDataLength, actualStaticDataLength);
    }

    return new Schema(staticFields, dynamicFields);
  }

  staticDataLength(): number {
    return this.staticFields.reduce((length, fieldType) => length + staticAbiTypeToByteLength[fieldType], 0);
  }

  isEmpty(): boolean {
    return this.staticFields.length === 0 && this.dynamicFields.length === 0;
  }

  toHex(): Hex {
    const staticSchemaTypes = this.staticFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
    const dynamicSchemaTypes = this.dynamicFields.map((abiType) => schemaAbiTypes.indexOf(abiType));
    return `0x${[
      this.staticDataLength().toString(16).padStart(4, "0"),
      this.staticFields.length.toString(16).padStart(2, "0"),
      this.dynamicFields.length.toString(16).padStart(2, "0"),
      ...staticSchemaTypes.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
      ...dynamicSchemaTypes.map((schemaType) => schemaType.toString(16).padStart(2, "0")),
    ]
      .join("")
      .padEnd(64, "0")}`;
  }

  decodeData(data: Hex): (StaticPrimitiveType | DynamicPrimitiveType)[] {
    const values: (StaticPrimitiveType | DynamicPrimitiveType)[] = [];

    let bytesOffset = 0;
    this.staticFields.forEach((fieldType) => {
      const fieldByteLength = staticAbiTypeToByteLength[fieldType];
      const value = decodeStaticField(fieldType, sliceHex(data, bytesOffset, bytesOffset + fieldByteLength));
      bytesOffset += fieldByteLength;
      values.push(value);
    });

    // Warn user if static data length doesn't match the schema, because data corruption might be possible.
    const actualStaticDataLength = bytesOffset;
    if (actualStaticDataLength !== this.staticDataLength()) {
      console.warn(
        "Decoded static data length does not match schema's expected static data length. Data may get corrupted. Is `getStaticByteLength` outdated?",
        {
          expectedLength: this.staticDataLength,
          actualLength: actualStaticDataLength,
          bytesOffset,
        }
      );
    }

    if (this.dynamicFields.length > 0) {
      const dataLayout = hexToPackedCounter(sliceHex(data, bytesOffset, bytesOffset + 32));
      bytesOffset += 32;

      this.dynamicFields.forEach((fieldType, i) => {
        const dataLength = dataLayout.fieldByteLengths[i];
        const value = decodeDynamicField(fieldType, sliceHex(data, bytesOffset, bytesOffset + dataLength));
        bytesOffset += dataLength;
        values.push(value);
      });

      // Warn user if dynamic data length doesn't match the schema, because data corruption might be possible.
      const actualDynamicDataLength = bytesOffset - 32 - actualStaticDataLength;
      // TODO: refactor this so we don't break for bytes offsets >UINT40
      if (BigInt(actualDynamicDataLength) !== dataLayout.totalByteLength) {
        console.warn(
          "Decoded dynamic data length does not match data layout's expected data length. Data may get corrupted. Did the data layout change?",
          {
            expectedLength: dataLayout.totalByteLength,
            actualLength: actualDynamicDataLength,
            bytesOffset,
          }
        );
      }
    }

    return values;
  }

  decodeField(fieldIndex: number, data: Hex): StaticPrimitiveType | DynamicPrimitiveType {
    return fieldIndex < this.staticFields.length
      ? decodeStaticField(this.staticFields[fieldIndex], data)
      : decodeDynamicField(this.dynamicFields[fieldIndex - this.staticFields.length], data);
  }
}
