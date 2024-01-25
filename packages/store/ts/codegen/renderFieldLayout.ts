import { RenderType } from "@latticexyz/common/codegen";
import { BYTE_TO_BITS, LayoutOffsets, MAX_DYNAMIC_FIELDS, MAX_TOTAL_FIELDS, WORD_LAST_INDEX } from "../constants";

type FieldLayoutRenderType = Pick<RenderType, "isDynamic" | "staticByteLength">;

// TODO: docs
export function renderFieldLayout(fields: FieldLayoutRenderType[]): string {
  return `FieldLayout constant _fieldLayout = FieldLayout.wrap(${encodeFieldLayout(fields)});`;
}

// TODO: docs
// Make sure this logic stays aligned with @latticexyz/store/src/FieldLayout.sol
function encodeFieldLayout(fields: FieldLayoutRenderType[]): string {
  const staticFields = fields.filter(({ isDynamic }) => !isDynamic);
  const numDynamicFields = fields.length - staticFields.length;

  let fieldLayout = 0n;
  let totalLength = 0;
  const totalFields = fields.length;

  if (totalFields > MAX_TOTAL_FIELDS) throw new Error("FieldLayout: too many fields");
  if (numDynamicFields > MAX_DYNAMIC_FIELDS) throw new Error("FieldLayout: too many dynamic fields");

  for (let i = 0; i < staticFields.length; i++) {
    const { isDynamic, staticByteLength } = fields[i];
    if (isDynamic) throw new Error(`FieldLayout: static type after dynamic type`);

    totalLength += staticByteLength;
    fieldLayout |= BigInt(staticByteLength) << BigInt((WORD_LAST_INDEX - 4 - i) * BYTE_TO_BITS);
  }

  fieldLayout |= BigInt(totalLength) << BigInt(LayoutOffsets.TOTAL_LENGTH);
  fieldLayout |= BigInt(staticFields.length) << BigInt(LayoutOffsets.NUM_STATIC_FIELDS);
  fieldLayout |= BigInt(numDynamicFields) << BigInt(LayoutOffsets.NUM_DYNAMIC_FIELDS);

  return `0x${fieldLayout.toString(16).padStart(64, "0")}`;
}
