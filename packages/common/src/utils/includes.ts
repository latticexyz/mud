// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function includes<item>(items: item[], value: any): value is item {
  return items.includes(value);
}
