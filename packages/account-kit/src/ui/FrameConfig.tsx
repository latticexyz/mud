import { useEffect } from "react";
import { useFrame } from "./FrameProvider";

export type Props = {
  mode: "modal";
};

export function FrameConfig({ mode }: Props) {
  const { frame } = useFrame();

  useEffect(() => {
    if (mode === "modal") {
      frame.style.position = "fixed";
      frame.style.inset = "0";
      frame.style.width = "100vw";
      frame.style.height = "100vh";
      frame.style.zIndex = "2147483646";
    }
  }, [frame, mode]);

  return <></>;
}
