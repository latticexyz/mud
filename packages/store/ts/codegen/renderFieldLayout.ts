import { RenderType } from "@latticexyz/common/codegen";
import { BYTE_TO_BITS, LayoutOffsets, MAX_DYNAMIC_FIELDS, MAX_TOTAL_FIELDS, WORD_LAST_INDEX } from "../constants";

export function renderFieldLayout(fields: RenderType[]) {
  return `FieldLayout constant _fieldLayout = FieldLayout.wrap(${encodeFieldLayout(fields)});`;
}

export function encodeFieldLayout(fields: RenderType[]) {
  if (fields.length > MAX_TOTAL_FIELDS) throw new Error(`FieldLayout: invalid length ${fields.length}`);
  let fieldLayout = 0n;
  let totalLength = 0;
  const staticFields = fields.filter(({ isDynamic }) => !isDynamic).length;
  const dynamicFields = fields.length - staticFields;

  for (let i = 0; i < staticFields; i++) {
    const { isDynamic, staticByteLength } = fields[i];
    if (isDynamic) throw new Error(`FieldLayout: static type after dynamic type`);

    totalLength += staticByteLength;
    fieldLayout |= BigInt(staticByteLength) << BigInt((WORD_LAST_INDEX - 4 - i) * BYTE_TO_BITS);
  }

  if (dynamicFields > MAX_DYNAMIC_FIELDS) throw new Error(`FieldLayout: invalid length ${dynamicFields}`);

  fieldLayout |= BigInt(totalLength) << BigInt(LayoutOffsets.TOTAL_LENGTH);
  fieldLayout |= BigInt(staticFields) << BigInt(LayoutOffsets.NUM_STATIC_FIELDS);
  fieldLayout |= BigInt(dynamicFields) << BigInt(LayoutOffsets.NUM_DYNAMIC_FIELDS);

  return `0x${fieldLayout.toString(16).padStart(64, "0")}`;
}
