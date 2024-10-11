export function timeAgo(timestamp: bigint) {
  const units = [
    { name: "y", limit: 365 * 24 * 60 * 60, inSeconds: 365 * 24 * 60 * 60 },
    { name: "mth", limit: 30 * 24 * 60 * 60, inSeconds: 30 * 24 * 60 * 60 },
    { name: "d", limit: 24 * 60 * 60, inSeconds: 24 * 60 * 60 },
    { name: "h", limit: 60 * 60, inSeconds: 60 * 60 },
    { name: "m", limit: 60, inSeconds: 60 },
    { name: "s", limit: 1, inSeconds: 1 },
  ];

  const currentTimestampSeconds = Math.floor(Date.now() / 1000);
  const diff = currentTimestampSeconds - Number(timestamp);

  if (diff < 0) {
    return "in the future";
  }

  for (const unit of units) {
    if (diff >= unit.limit) {
      const unitsAgo = Math.floor(diff / unit.inSeconds);
      return `${unitsAgo}${unit.name} ago`;
    }
  }

  return "0s ago";
}
