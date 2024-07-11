import { createContext, useContext, type ReactNode } from "react";

type ContextValue = {
  readonly frame: HTMLIFrameElement;
};

/** @internal */
const Context = createContext<ContextValue | null>(null);

export type Props = {
  frame: HTMLIFrameElement;
  children?: ReactNode;
};

export function FrameProvider({ frame, children }: Props) {
  const value = useContext(Context);
  if (value) throw new Error("`FrameProvider` can only be used once.");
  return <Context.Provider value={{ frame }}>{children}</Context.Provider>;
}

export function useFrame(): ContextValue {
  const value = useContext(Context);
  if (!value) throw new Error("`useFrame` can only be used within a `FrameProvider`.");
  return value;
}
