export type SnapSyncUserConfig = {
  /**
   * Enables "snap sync mode".
   * It allows clients to sync the latest state of the world using view functions.
   * This is a simple way to quickly sync without the use of an external indexer.
   * This could lead to expensive queries on live RPCs if the world is large,
   * so we suggest using MODE for production deployments.
   */
  snapSync: boolean;
};

export type SnapSyncConfig = SnapSyncUserConfig;
