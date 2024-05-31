import { InternalStore } from "./createInternalStore";

export type MountButtonOptions = {
  container: Element;
  internalStore: InternalStore;
};

export function mountButton({ container, internalStore }: MountButtonOptions): () => void {
  if (!internalStore.getState().rootContainer) {
    console.warn(
      "MUD Account Kit `mountButton` was called before `mount`. You will not see buttons rendered until `mount` is called.",
    );
  }

  internalStore.setState((state) => ({
    buttonContainers: [...state.buttonContainers, container],
  }));

  return () => {
    internalStore.setState((state) => ({
      buttonContainers: state.buttonContainers.filter((el) => el !== container),
    }));
  };
}
