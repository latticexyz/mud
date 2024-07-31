function hasNamedInputs(entry) {
  return entry.inputs && entry.inputs.some((input) => input.name);
}

export function deduplicateABI(abi) {
  const uniqueEntries = new Map();

  abi.forEach((entry) => {
    const key = `${entry.type}_${entry.name}`;
    const existingEntry = uniqueEntries.get(key);

    if (!existingEntry || (hasNamedInputs(entry) && !hasNamedInputs(existingEntry))) {
      uniqueEntries.set(key, entry);
    }
  });

  return Array.from(uniqueEntries.values());
}
