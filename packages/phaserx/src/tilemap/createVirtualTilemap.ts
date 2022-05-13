import { VirtualTilemap } from "./types";
import { WorldCoord } from "../types";
import { CoordMap, tileCoordToChunkCoord } from "../utils";
import { ChunkedTilemapConfig, createChunkedTilemap } from "./createChunkedTilemap";

export function createVirtualTilemap<TileKeys extends number, LayerKeys extends string>(
  config: Omit<ChunkedTilemapConfig<TileKeys, LayerKeys>, "tiles">
): VirtualTilemap<TileKeys, LayerKeys> {
  const {
    chunks,
    layerConfig: { layers, defaultLayer },
    tileWidth,
    tileHeight,
  } = config;

  const tiles: { [key in LayerKeys]: CoordMap<TileKeys> } = {} as never;

  for (const layerKey of Object.keys(layers)) {
    tiles[layerKey as LayerKeys] = new CoordMap<TileKeys>();
  }

  const chunkedTilemap = createChunkedTilemap({ ...config, tiles });

  function putTileAt(coord: WorldCoord, tile: TileKeys, layer?: LayerKeys, tint?: number) {
    // Update virtual tilemap
    tiles[layer || defaultLayer].set(coord, tile);

    // Immediately update the physical tile if the chunk is in view
    const chunk = tileCoordToChunkCoord(coord, tileWidth, tileHeight, chunks.chunkSize);
    if (chunkedTilemap.visible && chunks.visibleChunks.current.get(chunk)) {
      chunkedTilemap.putTileAt(coord, tile, layer, tint);
    }
  }

  return { ...chunkedTilemap, putTileAt, tiles };
}
