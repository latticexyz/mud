import { InternalStore } from "./createInternalStore";

export type MountButtonOptions = {
  container: Element;
  /** @internal */
  internalStore: InternalStore;
  /** @internal */
  ignoreMountWarning?: boolean;
};

export function mountButton({ container, internalStore, ignoreMountWarning }: MountButtonOptions): () => void {
  if (!ignoreMountWarning && !internalStore.getState().rootContainer) {
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
