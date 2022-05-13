import { map, Observable, Subject } from "rxjs";
import { Area, ChunkCoord } from "./types";
import { CoordMap, getChunksInArea, subtract } from "./utils";

export function createChunks(worldView$: Observable<Area>, chunkSize: number) {
  const visibleChunks = { current: new CoordMap<boolean>() };

  const addedChunks$ = new Subject<ChunkCoord>();
  const removedChunks$ = new Subject<ChunkCoord>();

  const visibleChunkStream = worldView$.pipe(
    map((area) => getChunksInArea(area, chunkSize)) // Calculate current chunks from the world view
  );

  visibleChunkStream.subscribe((newVisibleChunks) => {
    const added = subtract(newVisibleChunks, visibleChunks.current); // Chunks that are visible not but not before
    for (const coord of added.coords()) addedChunks$.next(coord);

    const removed = subtract(visibleChunks.current, newVisibleChunks); // Chunks that were visible before but not now
    for (const coord of removed.coords()) removedChunks$.next(coord);

    visibleChunks.current = newVisibleChunks;
  });

  return {
    addedChunks$: addedChunks$.asObservable(),
    removedChunks$: removedChunks$.asObservable(),
    chunkSize,
    visibleChunks,
  };
}
