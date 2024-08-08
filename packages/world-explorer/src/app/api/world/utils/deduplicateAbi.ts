import { Abi, AbiItem } from "viem";

function hasNamedInputs(entry: AbiItem) {
  if (!("inputs" in entry) || !entry.inputs || !entry.inputs.length) {
    return false;
  }
  return entry.inputs.some((input) => input.name);
}

export function deduplicateAbi(abi: Abi) {
  const uniqueEntries = new Map();

  for (const entry of abi) {
    let key: string = entry.type;
    if ("name" in entry) {
      key = `${entry.type}_${entry.name}`;
    }
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
