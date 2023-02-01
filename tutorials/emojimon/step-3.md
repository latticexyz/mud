# 3. Move player with arrow keys

```tsx #2,10-43 packages/client/src/GameBoard.tsx
 import { useComponentValueStream } from "@latticexyz/std-client";
+import { useEffect } from "react";
 import { useMUD } from "./MUDContext";

 export const GameBoard = () => {
 ...
     playerEntity
   );

+  useEffect(() => {
+    const moveTo = async (x: number, y: number) => {
+      const tx = await systems["system.Move"].executeTyped({ x, y });
+      await tx.wait();
+    };
+
+    const moveBy = async (deltaX: number, deltaY: number) => {
+      if (!playerPosition) {
+        console.warn(
+          "cannot moveBy without a player position, not yet spawned?"
+        );
+        return;
+      }
+      await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY);
+    };
+
+    const listener = (e: KeyboardEvent) => {
+      if (e.key === "ArrowUp") {
+        moveBy(0, -1);
+      }
+      if (e.key === "ArrowDown") {
+        moveBy(0, 1);
+      }
+      if (e.key === "ArrowLeft") {
+        moveBy(-1, 0);
+      }
+      if (e.key === "ArrowRight") {
+        moveBy(1, 0);
+      }
+    };
+    window.addEventListener("keydown", listener);
+    return () => window.removeEventListener("keydown", listener);
+  }, [playerPosition, systems]);
+
   return (
     <div className="inline-grid p-2 bg-lime-500">
       {rows.map((y) =>
```
