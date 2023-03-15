import { SchemaType } from "./SchemaType.js";

export function getStaticByteLength(schemaType: SchemaType) {
  const val = schemaType.valueOf();
  if (val < 32) {
    // uint8-256
    return val + 1;
  } else if (val < 64) {
    // int8-256, offset by 32
    return val + 1 - 32;
  } else if (val < 96) {
    // bytes1-32, offset by 64
    return val + 1 - 64;
  }

  // Other static types
  if (schemaType == SchemaType.BOOL) {
    return 1;
  } else if (schemaType == SchemaType.ADDRESS) {
    return 20;
  }

  // Return 0 for all dynamic types
  return 0;
}
