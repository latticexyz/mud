export type Error<reason extends string = string, metadata = null> = {
  error: true;
  reason: reason;
  metadata: metadata;
};
