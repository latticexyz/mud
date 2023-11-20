---
"@latticexyz/store-sync": minor
---

Added and populated `syncProgress` key in Zustand store for sync progress, like we do for RECS sync. This will let apps using `syncToZustand` render a loading state while initial client hydration is in progress.

```tsx
const syncProgress = useStore((state) => state.syncProgress);

if (syncProgress.step !== SyncStep.LIVE) {
  return <>Loading ({Math.floor(syncProgress.percentage)}%)</>;
}
```
