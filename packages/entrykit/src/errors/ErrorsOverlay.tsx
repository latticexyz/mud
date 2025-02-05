import { useStore } from "zustand";
import { store } from "./store";
import { ErrorOverlay } from "./ErrorOverlay";

export function ErrorsOverlay() {
  const error = useStore(store, (state) => state.errors.at(0));
  return <ErrorOverlay error={error?.error} retry={error?.retry} />;
}
