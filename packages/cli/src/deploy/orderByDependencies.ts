import toposort from "toposort";

export function orderByDependencies<T>(
  items: readonly T[],
  itemKey: (item: T) => string,
  dependencyKeys: (item: T) => string[],
): readonly T[] {
  const dependencyOrder = toposort(
    items.flatMap((item) => dependencyKeys(item).map((dependency) => [itemKey(item), dependency] as [string, string])),
  );
  return [...items].sort((a, b) => dependencyOrder.indexOf(itemKey(a)) - dependencyOrder.indexOf(itemKey(b)));
}
