import { chunkToPixelCoord } from "./utils";
import { CoordMap } from "@latticexyz/utils";
import { Camera, Chunks, ObjectPool } from "./types";
import { AnimatedTilemap } from "./tilemap";

function getRandomColor() {
  const red = Math.random() * 0xff;
  const green = Math.random() * 0xff;
  const blue = Math.random() * 0xff;
  return red * 0xffff + green * 0xff + blue;
}

export function createDebugger(
  camera: Camera,
  chunks: Chunks,
  scene: Phaser.Scene,
  objectPool: ObjectPool,
  map: AnimatedTilemap<number, string, string>
) {
  const options = {
    logViewport: false,
    visualizeChunks: true,
    visualizeViewport: false,
    logNumVisibleChunks: false,
    logObjectStats: false,
    logMaps: true,
  };

  const visualChunks = new CoordMap<Phaser.GameObjects.Rectangle>();
  const worldViewRect = scene.add.rectangle(0, 0, 1, 1, 0xff0000, 0.2);
  worldViewRect.setInteractive();
  worldViewRect.on("pointerup", () => {
    console.log("clicked", worldViewRect);
  });

  camera.worldView$.subscribe((worldView) => {
    if (options.logViewport) {
      console.log(worldView);
    }

    if (options.visualizeViewport) {
      worldViewRect.setScale(worldView.width, worldView.height);
      worldViewRect.setPosition(worldView.centerX, worldView.centerY);
    }

    if (options.logObjectStats) {
      console.log(
        `Entities: ${objectPool.objects.size} / Pool size: ${Object.values(objectPool.groups).reduce(
          (acc, curr) => acc + curr.getChildren().length,
          0
        )} / Pool active: ${Object.values(objectPool.groups).reduce((acc, curr) => acc + curr.countActive(), 0)}`
      );
    }

    if (options.logMaps) {
      console.log("Num maps", map.size());
    }
  });

  chunks.addedChunks$.subscribe((chunk) => {
    if (options.visualizeChunks) {
      const pixelCoord = chunkToPixelCoord(chunk, chunks.chunkSize);
      const visualChunk = scene.add.rectangle(
        pixelCoord.x + chunks.chunkSize / 2,
        pixelCoord.y + chunks.chunkSize / 2,
        chunks.chunkSize,
        chunks.chunkSize,
        getRandomColor(),
        0.5
      );
      visualChunk.setInteractive();
      visualChunk.on("pointerup", () => {
        console.log("clicked", visualChunk);
      });
      visualChunks.set(chunk, visualChunk);
    }

    if (options.logNumVisibleChunks) {
      console.log("Number of visible chunks: ", visualChunks.size);
    }
  });

  chunks.removedChunks$.subscribe((chunk) => {
    if (options.visualizeChunks) {
      visualChunks.get(chunk)?.destroy();
      visualChunks.delete(chunk);
    }

    if (options.logNumVisibleChunks) {
      console.log("Number of visible chunks: ", visualChunks.size);
    }
  });
}
