import { BehaviorSubject, distinctUntilChanged, from, map, mergeMap, pipe, tap } from "rxjs";
import { filterNullish } from "@latticexyz/utils";
import { Camera, ChunkCoord, Chunks, Coord, EmbodiedEntity, ObjectPool } from "./types";
import { pixelToChunkCoord, coordEq } from "./utils";
import { CoordMap } from "@latticexyz/utils";

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
  const addedChunkSub = chunks.addedChunks$.pipe(chunkToEntity).subscribe((entityObservable) => {
    entityObservable.subscribe((entity) => {
      if (entity) entity.spawn();
    });
  });
  // Despawn entites when their chunk disappears from the viewport
  const removedChunkSub = chunks.removedChunks$.pipe(chunkToEntity).subscribe((entityObservable) => {
    entityObservable.subscribe((entity) => {
      if (entity) entity.despawn();
    });
  });
  // Keep track of entity's chunk
  function trackEntity(entity: EmbodiedEntity<never>) {
    const entityPosition$ = new BehaviorSubject<ChunkCoord>(pixelToChunkCoord(entity.position, chunks.chunkSize));

    // Subscribe to entity position changes
    const entityPositionSub = entityPosition$
      .pipe(
        distinctUntilChanged((prev, curr) => coordEq(prev, curr)), // Игнорировать, если координаты не изменились
        tap((newChunk) => {
          // Registering a new chunk position
          chunkRegistry.set(entity.id, newChunk);

          // Checking the visibility of the new chunk
          const isVisible = chunks.visibleChunks.current.get(newChunk);
          if (isVisible) {
            entity.spawn();
          } else {
            entity.despawn();
          }
        })
      )
      .subscribe();

    // Saving a subscription for later unsubscription
    disposer.set(entity.id, () => entityPositionSub.unsubscribe());
  }

  // Setup tracking of entity chunks
  const objectPoolSub = objectPool.objects.subscribe((newObjects) => {
    newObjects.forEach((entity, id) => {
      if (!disposer.has(id)) {
        trackEntity(entity as EmbodiedEntity<never>);
      }
    });

    // Handling removals
    Array.from(disposer.keys()).forEach((id) => {
      if (!newObjects.has(id)) {
        chunkRegistry.remove(id);
        const dispose = disposer.get(id);
        if (dispose) dispose();
        disposer.delete(id);
      }
    });
  });

  return {
    dispose: () => {
      for (const d of disposer.values()) d();
      objectPoolSub.unsubscribe();
      addedChunkSub.unsubscribe();
      removedChunkSub.unsubscribe();
    },
  };
}
