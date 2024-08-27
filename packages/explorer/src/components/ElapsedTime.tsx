import { useEffect, useState } from "react";
import { timeSince } from "../lib/utils";

type Props = {
  timestamp: number;
};

export function ElapsedTime({ timestamp }: Props) {
  const [elapsedTime, setElapsedTime] = useState(timeSince(new Date(timestamp)));

  useEffect(() => {
    let animationFrameId: number;

    const updateElapsedTime = () => {
      setElapsedTime(timeSince(new Date(timestamp)));
      animationFrameId = requestAnimationFrame(updateElapsedTime);
    };

    animationFrameId = requestAnimationFrame(updateElapsedTime);

    return () => cancelAnimationFrame(animationFrameId);
  }, [timestamp]);

  return <>{elapsedTime}</>;
}
