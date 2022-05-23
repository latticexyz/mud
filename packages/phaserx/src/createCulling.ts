import { computed, observe, reaction } from "mobx";
import { from, map, mergeMap, pipe } from "rxjs";
import { filterNullish } from "@mudkit/utils";
import { Camera, ChunkCoord, Chunks, Coord, EmbodiedEntity, ObjectPool } from "./types";
import { CoordMap, pixelToChunkCoord, coordEq } from "./utils";

function createRegistry() {
  const coordToIds = new CoordMap<Set<string>>();
  const idToCoord = new Map<string, Coord>();

  function get(coord: Coord): Set<string> {
    let set = coordToIds.get(coord);
    if (!set) {
      set = new Set<string>();
      coordToIds.set(coord, set);
    }
    return set;
  }

  function set(id: string, coord: Coord) {
    // Remove from prev set
    const prevCoord = idToCoord.get(id);
    const idsAtPrevCoord = prevCoord && get(prevCoord);
    idsAtPrevCoord?.delete(id);

    // Add to new set
    const idsAtNewCoord = get(coord);
    idsAtNewCoord.add(id);

    // Set new idToCoord mapping
    idToCoord.set(id, coord);
  }

  function remove(id: string) {
    const prevCoord = idToCoord.get(id);
    const idsAtCoord = prevCoord && get(prevCoord);
    idsAtCoord?.delete(id);
    idToCoord.delete(id);
  }

  return { set, remove, get };
}

export function createCulling(objectPool: ObjectPool, camera: Camera, chunks: Chunks) {
  const chunkRegistry = createRegistry();
  const disposer = new Map<string, () => void>();

  const chunkToEntity = pipe(
    map((chunk: ChunkCoord) => from(chunkRegistry.get(chunk))), // Map to streams of entityIds
    mergeMap((entities) => entities), // Flatten the stream of entities
    map((entityId) => objectPool.get(entityId, "Existing")), // Map entityId to embodiedEntity
    filterNullish()
  );

  // Spawn entities when their chunk appears in the viewport
  const addedChunkSub = chunks.addedChunks$.pipe(chunkToEntity).subscribe((entity) => entity.spawn());

  // Despawn entites when their chunk disappears from the viewport
  const removedChunkSub = chunks.removedChunks$.pipe(chunkToEntity).subscribe((entity) => entity.despawn());

  // Keep track of entity's chunk
  function trackEntity(entity: EmbodiedEntity<never>) {
    if (disposer.get(entity.id)) console.error("Entity is being tracked multiple times", entity);
    const chunk = computed(() => pixelToChunkCoord(entity.position, chunks.chunkSize), { equals: coordEq });
    const dispose = reaction(
      () => chunk.get(),
      (newChunk) => {
        // Register the new chunk position
        chunkRegistry.set(entity.id, newChunk);

        // Check whether entity is in the viewport if it switched chunks
        const visible = chunks.visibleChunks.current.get(newChunk);
        if (visible) {
          entity.spawn();
        } else {
          entity.despawn();
        }
      },
      { fireImmediately: true }
    );
    disposer.set(entity.id, dispose);
  }

  // Setup tracking of entity chunks
  const disposeObjectPoolObserver = observe(objectPool.objects, (change) => {
    if (change.type === "add") {
      trackEntity(change.newValue as EmbodiedEntity<never>);
    }
    if (change.type === "delete") {
      chunkRegistry.remove(change.oldValue.id);
      const dispose = disposer.get(change.oldValue.id);
      if (dispose) dispose();
      disposer.delete(change.oldValue.id);
    }
  });

  return {
    dispose: () => {
      for (const d of disposer.values()) d();
      disposeObjectPoolObserver();
      addedChunkSub.unsubscribe();
      removedChunkSub.unsubscribe();
    },
  };
}
