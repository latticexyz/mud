import { Hex } from "viem";
import { MUDError } from "@latticexyz/common/errors";
import { StaticAbiType, staticAbiTypeToByteLength } from "@latticexyz/schema-type";

export class InvalidHexLengthError extends MUDError {
  override name = "InvalidHexValueError";
  constructor(value: Hex) {
    super(`Hex value "${value}" is an odd length (${value.length - 2}). It must be an even length.`);
  }
}

export class InvalidHexLengthForSchemaError extends MUDError {
  override name = "InvalidHexLengthForSchemaError";
  constructor(value: Hex) {
    super(`Hex value "${value}" has length of ${value.length - 2}, but expected length of 64 for a schema.`);
  }
}

export class InvalidHexLengthForPackedCounterError extends MUDError {
  override name = "InvalidHexLengthForPackedCounterError";
  constructor(value: Hex) {
    super(`Hex value "${value}" has length of ${value.length - 2}, but expected length of 64 for a packed counter.`);
  }
}

export class InvalidHexLengthForStaticFieldError extends MUDError {
  override name = "InvalidHexLengthForStaticFieldError";
  constructor(abiType: StaticAbiType, value: Hex) {
    super(
      `Hex value "${value}" has length of ${value.length - 2}, but expected length of ${
        staticAbiTypeToByteLength[abiType] * 2
      } for ${abiType} type.`
    );
  }
}

export class InvalidHexLengthForArrayFieldError extends MUDError {
  override name = "InvalidHexLengthForArrayFieldError";
  constructor(abiType: StaticAbiType, value: Hex) {
    super(
      `Hex value "${value}" has length of ${value.length - 2}, but expected a multiple of ${
        staticAbiTypeToByteLength[abiType] * 2
      } for ${abiType}[] type.`
    );
  }
}

export class SchemaStaticLengthMismatchError extends MUDError {
  override name = "SchemaStaticLengthMismatchError";
  constructor(schemaData: Hex, definedLength: number, summedLength: number) {
    super(
      `Schema "${schemaData}" static data length (${definedLength}) did not match the summed length of all static fields (${summedLength}). ` +
        `Is \`staticAbiTypeToByteLength\` up to date with Solidity schema types?`
    );
  }
}

export class PackedCounterLengthMismatchError extends MUDError {
  override name = "PackedCounterLengthMismatchError";
  constructor(packedCounterData: Hex, definedLength: bigint, summedLength: bigint) {
    super(
      `PackedCounter "${packedCounterData}" total bytes length (${definedLength}) did not match the summed length of all field byte lengths (${summedLength}).`
    );
  }
}
