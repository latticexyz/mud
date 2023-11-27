import { get } from "svelte/store";
import { MUDStore } from "./main";

export function useSystemCalls() {
  const store = get(MUDStore);
  return store ? store.systemCalls : null;
}

export function useComponents() {
  const store = get(MUDStore);
  return store ? store.components : null;
}

export function subscribeToComponentUpdate(component: any, store: any) {
  if (component && component.update$) {
    const unsubscribe = component.update$.subscribe((update: any) => {
      const [nextValue] = update.value;
      store.set(nextValue.value);
    });
    return unsubscribe;
  }
}
