import xlmJs from "xml-js";
import fs from "fs";
import glob from "glob";
import ejs from "ejs";
import path from "path";

const tilemaps = glob.sync("./tilesets/*.tsx");
enum PropertyName {
  Name = "name",
  Frame = "frame",
}
interface Tile {
  index: number;
  name: string;
  frameNumber?: number;
}

interface WangTile {
  index: number;
  wangId: number;
}

interface WangSet {
  name: string;
  wangTiles: WangTile[];
}

interface AnimatedTile {
  name: string;
  frames: number[];
}

interface Tilemap {
  name: string;
  tiles?: Tile[];
  animatedTiles?: AnimatedTile[];
  wangSets?: WangSet[];
}

const dumpObjectAsError = (obj: any) =>
  console.error(JSON.stringify(obj, null, 2));

const readTilemap = (filename: string) => {
  const content = fs.readFileSync(filename, { encoding: "utf-8" });
  const tilemapParsed = xlmJs.xml2js(content, { compact: true });
  return tilemapParsed;
};

const capitalize = (s: string) => {
  return `${s[0].toUpperCase()}${s.slice(1)}`;
};
interface WithName {
  name: string;
}
function removeDuplicate<A extends WithName>(v: A, i: number, a: A[]) {
  return a.findIndex((v2) => v2.name === v.name) === i;
}

const kebabToCamel = (kebab: string) => {
  const parts = kebab.split("-");
  let s = parts[0];
  for (const p of parts.slice(1)) {
    s = s + capitalize(p);
  }
  return s;
};

const processTilemap = (filename: string) => {
  const name = kebabToCamel(filename.split(path.sep).at(-1)!.split(".")[0]);
  console.log(`Processing ${name}`);
  const tilemap = readTilemap(filename);
  const elements = parseTilemap(name, tilemap);
  return elements;
};

const parseTilemap = (name: string, tilemap: xlmJs.ElementCompact): Tilemap => {
  const tileset = tilemap.tileset;
  const tiles = tileset.tile;
  const wangsets = tileset.wangsets?.wangset;
  let tileObjects;
  let animatedTiles;
  let wangsetObjects;
  if (tiles) {
    if (Array.isArray(tiles)) {
      console.log(`Parsing ${tiles.length} tiles`);
      tileObjects = tiles.filter(checkTile).map(parseTile);
      animatedTiles = buildAnimatedTileList(tileObjects);
      console.log(`Found ${animatedTiles.length} animated tiles`);
      tileObjects = tileObjects.filter((t: Tile) => !t.frameNumber);
      console.log(`Found ${tileObjects.length} tiles`);
    } else {
      console.log(`Parsing 1 tile`);
      tileObjects = [tiles].filter(checkTile).map(parseTile);
      animatedTiles = buildAnimatedTileList(tileObjects);
      console.log(`Found ${animatedTiles.length} animated tiles`);
      tileObjects = tileObjects.filter((t: Tile) => !t.frameNumber);
      console.log(`Found ${tileObjects.length} tiles`);
    }
  }
  if (wangsets) {
    if (Array.isArray(wangsets)) {
      console.log(`Parsing ${wangsets.length} wangsets`);
      wangsetObjects = wangsets.map(parseWangset);
    } else {
      console.log(`Parsing 1 wangset`);
      wangsetObjects = [parseWangset(wangsets)];
    }
  }
  return {
    name,
    tiles: tileObjects?.filter(removeDuplicate),
    animatedTiles: animatedTiles?.filter(removeDuplicate),
    wangSets: wangsetObjects?.filter(removeDuplicate),
  };
};

const findProperty = (element: xlmJs.ElementCompact, name: string) => {
  const properties: any = element.properties;
  const property = properties.property;
  if (Array.isArray(property)) {
    for (const p of property) {
      const n = p._attributes.name;
      if (n === name) {
        return p._attributes.value;
      }
    }
  } else {
    const n = property._attributes.name;
    if (n === name) {
      return property._attributes.value;
    }
  }
};

const checkTile = (tile: xlmJs.ElementCompact): boolean => {
  const indexUnparsed = tile._attributes!.id!;
  const index =
    indexUnparsed != undefined && typeof indexUnparsed === "string"
      ? parseInt(indexUnparsed)
      : undefined;
  if (index == undefined) {
    return false;
  }
  const name: string | undefined = findProperty(tile, PropertyName.Name);
  if (!name) {
    return false;
  }
  return true;
};

const parseTile = (tile: xlmJs.ElementCompact) => {
  const indexUnparsed = tile._attributes!.id!;
  const index =
    indexUnparsed && typeof indexUnparsed === "string"
      ? parseInt(indexUnparsed)
      : undefined;
  if (index == undefined) {
    dumpObjectAsError(tile);
    throw new Error("Tile has no index!");
  }
  const name: string | undefined = findProperty(tile, PropertyName.Name);
  if (!name) {
    dumpObjectAsError(tile);
    throw new Error("Tile has no name!");
  }
  const frameNumberUnparsed = findProperty(tile, PropertyName.Frame);
  const frameNumber = frameNumberUnparsed != undefined
    ? parseInt(frameNumberUnparsed)
    : undefined;
  const tileObject: Tile = {
    index,
    name,
    frameNumber,
  };
  return tileObject;
};

const parseWangtile = (wangtile: xlmJs.ElementCompact): WangTile => {
  const indexUnparsed = wangtile._attributes!.tileid!;
  const index =
    indexUnparsed !== undefined && typeof indexUnparsed === "string"
      ? parseInt(indexUnparsed)
      : undefined;
  if (index == undefined) {
    dumpObjectAsError(wangtile);
    throw new Error("Wangtile has no tileid!");
  }

  const wangIdUnparsed = wangtile._attributes!.wangid!;
  if ((wangIdUnparsed == undefined) || typeof wangIdUnparsed !== "string") {
    dumpObjectAsError(wangtile);
    throw new Error("Wangtile has no tileid!");
  }
  const binaryString = wangIdUnparsed.split(",").reverse().join("");
  const wangId = parseInt(binaryString, 2);
  return {
    index,
    wangId,
  };
};

const parseWangset = (wangset: xlmJs.ElementCompact): WangSet => {
  const name = wangset._attributes!.name!;
  if (!name || typeof name !== "string") {
    dumpObjectAsError(wangset);
    throw new Error("Wangset has no name!");
  }
  const wangtiles = wangset.wangtile;
  const wangtileObjects = wangtiles.map(parseWangtile);
  return {
    name,
    wangTiles: wangtileObjects,
  };
};

const buildAnimatedTileList = (tileObjects: Tile[]) => {
  const animatedTiles: AnimatedTile[] = [];
  const tilesWithSameNameAndFrameNumber: { [key: string]: Tile[] } = {};
  for (const tile of tileObjects) {
    if (tile.name && tile.frameNumber !== undefined) {
      if (tilesWithSameNameAndFrameNumber[tile.name]) {
        tilesWithSameNameAndFrameNumber[tile.name].push(tile);
      } else {
        tilesWithSameNameAndFrameNumber[tile.name] = [tile];
      }
    }
  }
  for (const [k, v] of Object.entries(tilesWithSameNameAndFrameNumber)) {
    animatedTiles.push({
      frames: v
        .sort((a, b) => a.frameNumber! - b.frameNumber!)
        .map((t) => t.index),
      name: k,
    });
  }
  return animatedTiles;
};

const tilemapObjects = tilemaps.map(processTilemap);

const TILEMAP_TYPE_TEMPLATE = `// GENERATED CODE - DO NOT MODIFY BY HAND

<% if(tiles){ -%>
export enum Tileset {
<% tiles.forEach(tile => { -%>
  <%= tile.name %> = <%= tile.index %>,
<% }) -%>
}
<% } -%>
<% if(animatedTiles){ -%>
export enum TileAnimationKey {
<% animatedTiles.forEach(animatedTile => { -%>
  <%= animatedTile.name %> = "<%= animatedTile.name %>",
<% }) -%>
}
export const TileAnimations: { [key in TileAnimationKey]: number[] } = {
<% animatedTiles.forEach(animatedTile => { -%>
  [TileAnimationKey.<%= animatedTile.name %>]: [<%= animatedTile.frames.join(", ") %>],
<% }) -%>
};
<% } -%>
<% if(wangSets){ -%>
export enum WangSetKey {
<% wangSets.forEach(wangSet => { -%>
  <%= wangSet.name %> = "<%= wangSet.name %>",
<% }) -%>
}
export const WangSets: { [key in WangSetKey]: { [key: number]: number } } = {
<% wangSets.forEach(wangSet => { -%>
  [WangSetKey.<%= wangSet.name %>]: {
  <% wangSet.wangTiles.forEach(wangTile => { -%>
    <%= wangTile.wangId %>: <%= wangTile.index %>,
  <% }) -%>
  },
<% }) -%>
};
<% } -%>`;

const renderTilemapTypes = (tilemap: Tilemap) => {
  return ejs.render(TILEMAP_TYPE_TEMPLATE, tilemap);
};

const tilemapTypes = tilemapObjects.map((t) => ({
  type: renderTilemapTypes(t),
  name: t.name,
}));
for (const tilemapType of tilemapTypes) {
  fs.writeFileSync(
    path.join(__dirname, "..", "..", "client", "src", "artTypes", `${tilemapType.name}.ts`),
    tilemapType.type
  );
}
