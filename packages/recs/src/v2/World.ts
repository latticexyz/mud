export function createWorld() {
  const entityToIndex = new Map<string, number>();
  const entities: string[] = [];

  function registerEntity({ id, idSuffix }: { id?: string; idSuffix?: string } = {}) {
    const entity = id || entities.length + (idSuffix ? "-" + idSuffix : "");
    const index = entities.push(entity) - 1;
    entityToIndex.set(entity, index);
    return index;
  }

  return { entities, entityToIndex, registerEntity };
}
