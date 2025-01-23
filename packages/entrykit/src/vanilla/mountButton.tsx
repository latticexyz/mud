import { internalStore } from "./internalStore";

export function mountButton(container: Element): () => void {
  if (!internalStore.getState().rootContainer) {
    console.warn(
      "EntryKit `mountButton` was called before `mount`. You will not see buttons rendered until `mount` is called.",
    );
  }

  internalStore.setState((state) => ({
    buttonContainers: [...state.buttonContainers, container],
  }));

  return function unmount() {
    internalStore.setState((state) => ({
      buttonContainers: state.buttonContainers.filter((el) => el !== container),
    }));
  };
}
