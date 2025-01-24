export async function iteratorToArray<T>(iterator: AsyncIterable<T>): Promise<readonly T[]> {
  const items: T[] = [];
  for await (const item of iterator) {
    items.push(item);
  }
  return items;
}
