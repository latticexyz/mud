export function serializeWithoutIndexedValues(obj: any) {
  return JSON.stringify(obj, (key, value) => {
    // strip indexed values
    if (/^\d+$/.test(key)) {
      return;
    }
    // serialize bigints as strings
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
}
