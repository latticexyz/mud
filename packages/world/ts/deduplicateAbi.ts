import { Abi, AbiItem } from "viem";

function hasNamedInputs(entry: AbiItem) {
  if (!("inputs" in entry) || !entry.inputs || !entry.inputs.length) {
    return false;
  }
  return entry.inputs.some((input) => input.name);
}

// during deduplication, favor ABI items with named inputs
export function deduplicateAbi(abi: Abi) {
  const uniqueEntries = new Map();

  for (const entry of abi) {
    const key = "name" in entry ? `${entry.type}_${entry.name}` : entry.type;
    const existingEntry = uniqueEntries.get(key);

    if (!existingEntry || (hasNamedInputs(entry) && !hasNamedInputs(existingEntry))) {
      uniqueEntries.set(key, entry);
    }
  }

  return Array.from(uniqueEntries.values());
}
