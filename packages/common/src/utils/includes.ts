export function includes<item>(items: item[], value: any): value is item {
  return items.includes(value);
}
