import { internalStore } from "./internalStore";

export function mountButton(container: Element): () => void {
  // if (!internalStore.getState().rootContainer) {
  //   // TODO: convert this to a warning instead so folks can use `mountButton` ahead of `mount`?
  //   throw new Error("MUD Account Kit is not yet mounted. Call `mount` first.");
  // }

  internalStore.setState((state) => ({
    buttonContainers: [...state.buttonContainers, container],
  }));

  return () => {
    internalStore.setState((state) => ({
      buttonContainers: state.buttonContainers.filter((el) => el !== container),
    }));
  };
}
