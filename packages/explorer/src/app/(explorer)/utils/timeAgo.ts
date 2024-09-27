export function timeAgo(timestamp: bigint) {
  const units = [
    { name: "y", limit: 365 * 24 * 60 * 60 * 1000, inMilliseconds: 365 * 24 * 60 * 60 * 1000 },
    { name: "mth", limit: 30 * 24 * 60 * 60 * 1000, inMilliseconds: 30 * 24 * 60 * 60 * 1000 },
    { name: "d", limit: 24 * 60 * 60 * 1000, inMilliseconds: 24 * 60 * 60 * 1000 },
    { name: "h", limit: 60 * 60 * 1000, inMilliseconds: 60 * 60 * 1000 },
    { name: "m", limit: 60 * 1000, inMilliseconds: 60 * 1000 },
    { name: "s", limit: 1000, inMilliseconds: 1000 },
  ];

  const diff = Date.now() - new Date(timestamp.toString()).getTime();
  if (diff < 0) {
    return "in the future";
  }

  for (const unit of units) {
    if (diff > unit.limit) {
      const unitsAgo = Math.floor(diff / unit.inMilliseconds);
      return `${unitsAgo}${unit.name} ago`;
    }
  }

  return "0s ago";
}
