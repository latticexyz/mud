import { useEffect, useState } from "react";
import { Badge } from "../../../../../../components/ui/Badge";
import { timeAgo } from "../../../../utils/timeAgo";

export function TimeAgoCell({ timestamp }: { timestamp: bigint }) {
  const [ago, setAgo] = useState(() => timeAgo(timestamp));

  useEffect(() => {
    const timer = setInterval(() => {
      setAgo(timeAgo(timestamp));
    }, 1000);

    return () => clearInterval(timer);
  }, [timestamp]);

  return <Badge variant="outline">{ago}</Badge>;
}
