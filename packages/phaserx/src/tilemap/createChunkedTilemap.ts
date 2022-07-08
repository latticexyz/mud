import { ChunkedTilemap } from "./types";
import { ChunkCoord, Chunks, WorldCoord } from "../types";
import { mod, CoordMap, chunkToPixelCoord, tileCoordToChunkCoord, chunkCoordToTileCoord } from "../utils";
import { MultiHueTintPipeline } from "../pipelines";
import { pickRandom } from "@latticexyz/utils";

export type ChunkedTilemapConfig<TileKeys extends number, LayerKeys extends string> = {
  scene: Phaser.Scene;
  tilesets: { [key: string]: Phaser.Tilemaps.Tileset };
  layerConfig: {
    layers: { [id in LayerKeys]: { tilesets: string[]; hasHueTintShader?: boolean } };
    defaultLayer: LayerKeys;
  };
  chunks: Chunks;
  backgroundTile: [number, ...number[]];
  tiles: { [layer in LayerKeys]: CoordMap<TileKeys> };
  tileWidth: number;
  tileHeight: number;
};

export function createChunkedTilemap<TileKeys extends number, LayerKeys extends string>(
  params: ChunkedTilemapConfig<TileKeys, LayerKeys>
): ChunkedTilemap<TileKeys, LayerKeys> {
  const { scene, tilesets, layerConfig, chunks, backgroundTile, tiles, tileWidth, tileHeight } = params;
  const relevantTilesets = Object.keys(layerConfig.layers)
    .map((key) => layerConfig.layers[key as LayerKeys].tilesets)
    .flat();

  // Chunk pixel size must be a multiple of tile witdth and height.
  if (mod(chunks.chunkSize, tileWidth) !== 0 || mod(chunks.chunkSize, tileHeight) !== 0) {
    throw new Error("Chunks pixel size must be a multiple of tile width and height to be used with chunked tilemap");
  }

  /*****************************************************
   Setup 
   *****************************************************/

  const maps = new CoordMap<Phaser.Tilemaps.Tilemap>();
  const chunkTileSize = { x: chunks.chunkSize / tileWidth, y: chunks.chunkSize / tileHeight };
  const disposer = new Set<() => void>();
  const visible = { current: true };

  // Render all current chunks
  for (const chunk of chunks.visibleChunks.current.coords()) {
    renderChunk(chunk);
  }
  // Render maps when they're in the viewport
  const addedChunkSub = chunks.addedChunks$.subscribe((chunk) => {
    renderChunk(chunk);
  });

  // Remove maps that are not in the viewport
  const removedChunkSub = chunks.removedChunks$.subscribe((chunk) => {
    destroyChunk(chunk);
  });

  disposer.add(() => addedChunkSub?.unsubscribe());
  disposer.add(() => removedChunkSub?.unsubscribe);

  /*****************************************************
   Functions 
   *****************************************************/

  function createLayers(
    map: Phaser.Tilemaps.Tilemap,
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ): {
    layers: Phaser.Tilemaps.TilemapLayer[];
    defaultLayer: Phaser.Tilemaps.TilemapLayer;
  } {
    const layers: { [key: string]: Phaser.Tilemaps.TilemapLayer } = {};

    for (const key of Object.keys(layerConfig.layers)) {
      const layer = layerConfig.layers[key as LayerKeys];
      layers[key] = map.createBlankLayer(
        key,
        layer.tilesets.map((id) => tilesets[id]),
        x,
        y,
        width,
        height
      );

      if (layer.hasHueTintShader) {
        layers[key].pipeline = (scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.get(
          MultiHueTintPipeline.KEY
        );
      }
    }

    return { layers: Object.values(layers), defaultLayer: layers[layerConfig.defaultLayer] };
  }

  function createMap(chunkCoord: WorldCoord): Phaser.Tilemaps.Tilemap {
    const data: Phaser.Tilemaps.MapData = new Phaser.Tilemaps.MapData({
      tileHeight,
      tileWidth,
      width: chunkTileSize.x,
      height: chunkTileSize.y,
      tilesets: Object.entries(tilesets)
        .filter(([key]) => relevantTilesets.includes(key))
        .map(([, tileset]) => tileset),
    });

    const map = new Phaser.Tilemaps.Tilemap(scene, data);
    const topLeft = chunkToPixelCoord(chunkCoord, chunks.chunkSize);
    const { defaultLayer } = createLayers(map, scene, topLeft.x, topLeft.y, chunkTileSize.x, chunkTileSize.y);
    map.setLayer(defaultLayer);
    maps.set(chunkCoord, map);
    return map;
  }

  function getMapAtChunkCoord(chunkCoord: WorldCoord): Phaser.Tilemaps.Tilemap {
    return maps.get(chunkCoord) || createMap(chunkCoord);
  }

  function getMapAtTileCoord(tileCoord: WorldCoord): Phaser.Tilemaps.Tilemap {
    const chunkCoord = tileCoordToChunkCoord(tileCoord, tileWidth, tileHeight, chunks.chunkSize);
    return getMapAtChunkCoord(chunkCoord);
  }

  function destroyChunk(chunkCoord: WorldCoord) {
    const map = getMapAtChunkCoord(chunkCoord);
    map.destroy();
    maps.delete(chunkCoord);
  }

  function putTileAt(coord: WorldCoord, tile: number, layer?: string, tint?: number) {
    if (!visible.current) return;
    const map = getMapAtTileCoord(coord);
    const putTile = map.putTileAt(tile, mod(coord.x, chunkTileSize.x), mod(coord.y, chunkTileSize.y), undefined, layer);
    putTile.width = map.tileWidth;
    putTile.height = map.tileHeight;

    if (tint) {
      putTile.tint = tint;
    }

    if (putTile == null) {
      throw new Error("Put tile at failed");
    }
  }

  function getTileAt(coord: WorldCoord, layer?: string) {
    const map = getMapAtTileCoord(coord);
    const tile = map.getTileAt(mod(coord.x, chunkTileSize.x), mod(coord.y, chunkTileSize.y), undefined, layer);
    if (tile == null) {
      throw new Error("No tile here");
    }
    return tile.index as TileKeys;
  }

  function renderChunk(chunkCoord: ChunkCoord) {
    if (!visible.current) return;
    const map = getMapAtChunkCoord(chunkCoord);
    const topLeftCoord = chunkCoordToTileCoord(chunkCoord, tileWidth, tileHeight, chunks.chunkSize);

    for (const layer of Object.keys(layerConfig.layers))
      map.forEachTile(
        (tile) => {
          const coord = { x: topLeftCoord.x + tile.x, y: topLeftCoord.y + tile.y };
          const defaultIndex = layer === layerConfig.defaultLayer ? pickRandom(backgroundTile) : -1;
          const index = tiles[layer as LayerKeys].get(coord) || defaultIndex;
          tile.index = index;
        },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        layer
      );
  }

  function dispose() {
    for (const map of maps.values()) {
      map.destroy();
    }
    maps.clear();
    for (const d of disposer) {
      d();
    }
  }

  function size() {
    return maps.size;
  }

  function setVisible(v: boolean) {
    if (v === visible.current) return;
    visible.current = v;
    for (const chunk of chunks.visibleChunks.current.coords()) {
      visible.current ? renderChunk(chunk) : destroyChunk(chunk);
    }
  }

  return { size, putTileAt, getTileAt, dispose, setVisible, visible, tileWidth, tileHeight };
}
