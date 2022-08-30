/* eslint-disable @typescript-eslint/no-explicit-any */
import { Gesture } from "@use-gesture/vanilla";
import { BehaviorSubject, map, sampleTime, scan, Subject, throttleTime } from "rxjs";
import { tileCoordToPixelCoord } from "./utils";
import { Camera, CameraConfig, Coord, GestureState, ObjectPool } from "./types";

export function createCamera(phaserCamera: Phaser.Cameras.Scene2D.Camera, options: CameraConfig): Camera {
  const phaserGame = document.getElementById(options.phaserSelector);
  if (!phaserGame) {
    throw new Error("Could not connect camera input. No element with id " + options.phaserSelector);
  }

  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());

  const worldView$ = new BehaviorSubject<Phaser.Cameras.Scene2D.Camera["worldView"]>(phaserCamera.worldView);
  const zoom$ = new BehaviorSubject<number>(phaserCamera.zoom);
  const wheelStream$ = new Subject<GestureState<"onWheel">>();
  const pinchStream$ = new Subject<GestureState<"onPinch">>();

  const gesture = new Gesture(
    phaserGame,
    {
      onPinch: (state: any) => pinchStream$.next(state),
      onWheel: (state: any) => wheelStream$.next(state),
    },
    {}
  );

  // function getNearestLevel(currentZoom: number): number {
  //   return Math.pow(2, Math.floor(Math.log(currentZoom * 2) / Math.log(2))) / 2;
  // }

  const pinchSub = pinchStream$
    .pipe(
      throttleTime(10),
      map((state) => state.offset[0]), // Compute pinch speed
      map((zoom) => Math.min(Math.max(zoom, options.minZoom), options.maxZoom)), // Limit zoom values
      scan((acc, curr) => [acc[1], curr], [1, 1]) // keep track of the last value to offset the map position (not implemented yet)
    )
    .subscribe(([, zoom]) => {
      // Set the gesture zoom state to the current zoom value to avoid zooming beyond the max values
      if (gesture._ctrl.state.pinch) gesture._ctrl.state.pinch.offset[0] = zoom;
      phaserCamera.setZoom(zoom);
      worldView$.next(phaserCamera.worldView);
      zoom$.next(zoom);
    });

  const wheelSub = wheelStream$
    .pipe(
      sampleTime(10),
      map((state) => state.delta.map((x) => x * options.wheelSpeed)), // Compute wheel speed
      map((movement) => movement.map((m) => m / phaserCamera.zoom)), // Adjust for current zoom value
      map((movement) => [phaserCamera.scrollX + movement[0], phaserCamera.scrollY + movement[1]]) // Compute new pinch
    )
    .subscribe(([x, y]) => {
      phaserCamera.setScroll(x, y);
      worldView$.next(phaserCamera.worldView);
    });

  function ignore(objectPool: ObjectPool, ignore: boolean) {
    objectPool.ignoreCamera(phaserCamera.id, ignore);
  }

  function centerOnCoord(tileCoord: Coord, tileWidth: number, tileHeight: number) {
    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);
    centerOn(pixelCoord.x, pixelCoord.y);
  }

  function centerOn(x: number, y: number) {
    phaserCamera.centerOn(x, y);
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  }

  function setScroll(x: number, y: number) {
    phaserCamera.setScroll(x, y);
    requestAnimationFrame(() => worldView$.next(phaserCamera.worldView));
  }

  return {
    phaserCamera,
    worldView$,
    zoom$,
    ignore,
    dispose: () => {
      pinchSub.unsubscribe();
      wheelSub.unsubscribe();
      gesture.destroy();
    },
    centerOnCoord,
    centerOn,
    setScroll,
  };
}
