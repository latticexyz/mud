import React from "react";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";
import { isHex } from "viem";
import { TruncatedHex } from "../TruncatedHex";

type Props = {
  value: SchemaAbiTypeToPrimitiveType<SchemaAbiType>;
};

export function FieldValue({ value }: Props) {
  return Array.isArray(value) ? (
    value.map((item, i) => (
      <React.Fragment key={JSON.stringify({ i, value })}>
        {i > 0 ? ", " : null}
        <FieldValue value={item} />
      </React.Fragment>
    ))
  ) : isHex(value) ? (
    <TruncatedHex hex={value} />
  ) : (
    <>{String(value)}</>
  );
}
