import { deferred } from "@latticexyz/utils";

export async function load(scene: Phaser.Scene, callback: (loader: Phaser.Loader.LoaderPlugin) => void) {
  const loader = scene.load;
  callback(loader);
  loader.start();
  const [resolve, , promise] = deferred<void>();
  loader.on("complete", () => {
    resolve();
  });
  return promise;
}
