import { MUDError } from "@latticexyz/common/errors";
import { Hex } from "viem";
import { StaticAbiType, staticAbiTypeToByteLength } from "./staticAbiTypes";

export class InvalidHexLengthError extends MUDError {
  override name = "InvalidHexValueError";
  constructor(value: Hex) {
    super(`Hex value "${value}" is an odd length (${value.length - 2}). It must be an even length.`);
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
