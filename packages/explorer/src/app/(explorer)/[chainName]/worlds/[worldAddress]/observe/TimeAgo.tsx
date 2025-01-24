import { useEffect, useState } from "react";
import { timeAgo } from "../../../../utils/timeAgo";

export function TimeAgo({ timestamp }: { timestamp: bigint }) {
  const [ago, setAgo] = useState(() => timeAgo(timestamp));

  useEffect(() => {
    const timer = setInterval(() => {
      setAgo(timeAgo(timestamp));
    }, 1000);

    return () => clearInterval(timer);
  }, [timestamp]);

  return (
    <span className="inline-block min-w-[60px] text-white/60" title={new Date(Number(timestamp) * 1000).toISOString()}>
      {ago}
    </span>
  );
}
