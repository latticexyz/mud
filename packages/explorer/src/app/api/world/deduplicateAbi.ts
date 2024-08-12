import { Abi, AbiItem, toFunctionSignature } from "viem";

function hasNamedInputs(entry: AbiItem) {
  if (!("inputs" in entry) || !entry.inputs || !entry.inputs.length) {
    return false;
  }
  return entry.inputs.some((input) => input.name);
}

// favor ABI items with named inputs when deduplicating
export function deduplicateAbi(abi: Abi) {
  const uniqueEntries = new Map();

  for (const entry of abi) {
    const key =
      entry.type === "function"
        ? toFunctionSignature(entry)
        : "name" in entry
          ? `${entry.type}_${entry.name}`
          : entry.type;
    const existingEntry = uniqueEntries.get(key);

    if (
      !existingEntry ||
      (hasNamedInputs(entry) && !hasNamedInputs(existingEntry))
    ) {
      uniqueEntries.set(key, entry);
    }
  }

  return Array.from(uniqueEntries.values());
}
