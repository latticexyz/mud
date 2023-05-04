import { useStore } from "../useStore";
import { StoreTable } from "./StoreTable";

export function StoreDataPage() {
  const cacheStore = useStore((state) => state.cacheStore);

  if (!cacheStore) {
    return <div className="p-2">Cache store not yet initialized</div>;
  }

  return (
    <div className="p-6 pt-4 space-y-6">
      {cacheStore.components.map((component) => (
        <StoreTable key={component} cacheStore={cacheStore} component={component} />
      ))}
    </div>
  );
}
