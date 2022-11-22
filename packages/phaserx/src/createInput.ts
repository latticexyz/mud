import {
  bufferCount,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  pairwise,
  scan,
  Subject,
  throttleTime,
} from "rxjs";
import { observable, reaction, runInAction } from "mobx";
import { Area } from "./types";
import { filterNullish } from "@latticexyz/utils";

export type Key = keyof typeof Phaser.Input.Keyboard.KeyCodes | "POINTER_LEFT" | "POINTER_RIGHT";

export function createInput(inputPlugin: Phaser.Input.InputPlugin) {
  const disposers = new Set<() => void>();
  const enabled = { current: true };

  inputPlugin.mouse?.disableContextMenu();

  function disableInput() {
    enabled.current = false;
  }

  function enableInput() {
    enabled.current = true;
  }

  function setCursor(cursor: string) {
    inputPlugin.setDefaultCursor(cursor);
  }

  const keyboard$ = new Subject<Phaser.Input.Keyboard.Key>();

  const pointermove$ = fromEvent(document, "mousemove").pipe(
    filter(() => enabled.current),
    map(() => {
      return { pointer: inputPlugin.manager?.activePointer };
    }),
    filterNullish()
  );

  const pointerdown$: Observable<{ pointer: Phaser.Input.Pointer; event: MouseEvent }> = fromEvent(
    document,
    "mousedown"
  ).pipe(
    filter(() => enabled.current),
    map((event) => ({ pointer: inputPlugin.manager?.activePointer, event: event as MouseEvent })),
    filterNullish()
  );

  const pointerup$: Observable<{ pointer: Phaser.Input.Pointer; event: MouseEvent }> = fromEvent(
    document,
    "mouseup"
  ).pipe(
    filter(() => enabled.current),
    map((event) => ({ pointer: inputPlugin.manager?.activePointer, event: event as MouseEvent })),
    filterNullish()
  );

  // Click stream
  const click$ = merge(pointerdown$, pointerup$).pipe(
    filter(() => enabled.current),
    map<{ pointer: Phaser.Input.Pointer; event: MouseEvent }, [boolean, number]>(({ event }) => [
      event.type === "mousedown" && event.button === 0,
      Date.now(),
    ]), // Map events to whether the left button is down and the current timestamp
    bufferCount(2, 1), // Store the last two timestamps
    filter(([prev, now]) => prev[0] && !now[0] && now[1] - prev[1] < 250), // Only care if button was pressed before and is not anymore and it happened within 500ms
    map(() => inputPlugin.manager?.activePointer), // Return the current pointer
    filterNullish()
  );

  // Double click stream
  const doubleClick$ = pointerdown$.pipe(
    filter(() => enabled.current),
    map(() => Date.now()), // Get current timestamp
    bufferCount(2, 1), // Store the last two timestamps
    filter(([prev, now]) => now - prev < 500), // Filter clicks with more than 500ms distance
    throttleTime(500), // A third click within 500ms is not counted as another double click
    map(() => inputPlugin.manager?.activePointer), // Return the current pointer
    filterNullish()
  );

  // Right click stream
  const rightClick$ = merge(pointerdown$, pointerup$).pipe(
    filter(({ pointer }) => enabled.current && pointer.rightButtonDown()),
    map(() => inputPlugin.manager?.activePointer), // Return the current pointer
    filterNullish()
  );

  // Drag stream
  const drag$ = merge(
    pointerdown$.pipe(map(() => undefined)), // Reset the drag on left click
    merge(pointerup$, pointermove$).pipe(
      pairwise(), // Take the last two move or pointerup events
      scan<[{ pointer: Phaser.Input.Pointer }, { pointer: Phaser.Input.Pointer }], Area | undefined>(
        (acc, [{ pointer: prev }, { pointer: curr }]) =>
          curr.leftButtonDown() // If the left butten is pressed...
            ? prev.leftButtonDown() && acc // If the previous event wasn't mouseup and if the drag already started...
              ? { ...acc, width: curr.worldX - acc.x, height: curr.worldY - acc.y } // Update the width/height
              : { x: curr.worldX, y: curr.worldY, width: 0, height: 0 } // Else start the drag
            : undefined,
        undefined
      ),
      filterNullish(),
      filter((area) => Math.abs(area.width) > 10 && Math.abs(area.height) > 10) // Prevent clicking to be mistaken as a drag
    )
  ).pipe(
    filter(() => enabled.current),
    distinctUntilChanged() // Prevent same value to be emitted in a row
  );

  const pressedKeys = observable(new Set<Key>());
  const phaserKeyboard = inputPlugin.keyboard;
  const codeToKey = new Map<number, Key>();

  // Listen to all keys
  for (const key of Object.keys(Phaser.Input.Keyboard.KeyCodes)) addKey(key);

  // Subscriptions
  const keySub = keyboard$.pipe(filter(() => enabled.current)).subscribe((key) => {
    const keyName = codeToKey.get(key.keyCode);
    if (!keyName) return;
    runInAction(() => {
      if (key.isDown) pressedKeys.add(keyName);
      if (key.isUp) pressedKeys.delete(keyName);
    });
  });
  disposers.add(() => keySub?.unsubscribe());

  const pointerSub = merge(pointerdown$, pointerup$).subscribe(({ pointer }) => {
    runInAction(() => {
      if (pointer.leftButtonDown()) pressedKeys.add("POINTER_LEFT");
      else pressedKeys.delete("POINTER_LEFT");

      if (pointer.rightButtonDown()) pressedKeys.add("POINTER_RIGHT");
      else pressedKeys.delete("POINTER_RIGHT");
    });
    //
  });
  disposers.add(() => pointerSub?.unsubscribe());

  // Adds a key to include in the state
  function addKey(key: string) {
    if (!phaserKeyboard) {
      console.warn(`Adding key ${key} failed. No phaser keyboard detected.`);
      return;
    }

    // Add the key to the phaser keyboard input plugin
    const keyObj = phaserKeyboard.addKey(key, false);
    // Store the cleartext key map
    codeToKey.set(keyObj.keyCode, key as Key);

    keyObj.removeAllListeners();
    keyObj.emitOnRepeat = true;
    keyObj.on("down", (keyEvent: Phaser.Input.Keyboard.Key) => keyboard$.next(keyEvent));
    keyObj.on("up", (keyEvent: Phaser.Input.Keyboard.Key) => keyboard$.next(keyEvent));
  }

  function onKeyPress(keySelector: (pressedKeys: Set<Key>) => boolean, callback: () => void) {
    const disposer = reaction(
      () => keySelector(pressedKeys),
      (passes) => {
        if (passes) callback();
      },
      { fireImmediately: true }
    );
    disposers.add(disposer);
  }

  function dispose() {
    for (const disposer of disposers) {
      disposer();
    }
  }

  return {
    keyboard$: keyboard$.asObservable(),
    pointermove$,
    pointerdown$,
    pointerup$,
    click$,
    doubleClick$,
    rightClick$,
    drag$,
    pressedKeys,
    dispose,
    disableInput,
    enableInput,
    setCursor,
    enabled,
    onKeyPress,
  };
}
