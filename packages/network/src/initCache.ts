import { arrayToIterator, deferred, mergeIterators, transformIterator } from "@latticexyz/utils";
import fakeIndexedDb from "fake-indexeddb";

// Use an indexedDB mock for nodejs environments
// TODO: remove indexedDB requirement for better nodejs support
const indexedDB = typeof self === "undefined" ? fakeIndexedDb : self.indexedDB;
const VERSION = 2;

/**
 * Initialize an indexedDB store.
 *
 * @param db IDBDatabase
 * @param storeId Id of the store to initialize
 */
function initStore(db: IDBDatabase, storeId: string) {
  if (!db.objectStoreNames.contains(storeId)) {
    db.createObjectStore(storeId);
  }
}

/**
 * Initialize an indexedDB database.
 *
 * @param dbId Id of the database to initialize.
 * @param stores Keys of the stores to initialize.
 * @param version Optional: version of the database to initialize.
 * @param idb Optional: custom indexedDB factory
 * @returns Promise resolving with IDBDatabase object
 */
function initDb(dbId: string, stores: string[], version = VERSION, idb: IDBFactory = indexedDB) {
  const [resolve, reject, promise] = deferred<IDBDatabase>();

  const request = idb.open(dbId, version);

  // Create store and index
  request.onupgradeneeded = () => {
    const db = request.result;
    for (const store of stores) {
      initStore(db, store);
    }
  };

  request.onsuccess = () => {
    const db = request.result;
    resolve(db);
  };

  request.onerror = (error) => {
    reject(new Error(JSON.stringify(error)));
  };

  return promise;
}

type Stores = { [key: string]: unknown };
type StoreKey<S extends Stores> = keyof S & string;

/**
 * Initialize an abstracted Cache object to simplify interaction with the indexedDB database.
 *
 * @param id Id of the database to initialize.
 * @param stores Keys of the stores to initialize.
 * @param version Optional: version of the database to initialize.
 * @param idb Optional: custom indexedDB factory
 * @returns Promise resolving with Cache object
 */
export async function initCache<S extends Stores>(
  id: string,
  stores: StoreKey<S>[],
  version?: number,
  idb?: IDBFactory
) {
  const db = await initDb(id, stores, version, idb);

  function openStore(store: StoreKey<S>): IDBObjectStore {
    const tx = db.transaction(store, "readwrite");
    const objectStore = tx.objectStore(store);
    return objectStore;
  }

  function set<Store extends StoreKey<S>>(store: Store, key: string, value: S[Store], ignoreResult = false) {
    const objectStore = openStore(store);
    const request = objectStore.put(value, key);

    if (ignoreResult) return;

    const [resolve, reject, promise] = deferred<void>();

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      resolve();
    };

    return promise;
  }

  function get<Store extends StoreKey<S>>(store: Store, key: string): Promise<S[Store] | undefined> {
    const [resolve, reject, promise] = deferred<S[Store] | undefined>();

    const objectStore = openStore(store);
    const request = objectStore.get(key);

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      const item = request.result;
      resolve(item);
    };

    return promise;
  }

  function remove(store: StoreKey<S>, key: string): Promise<void> {
    const [resolve, reject, promise] = deferred<void>();

    const objectStore = openStore(store);
    const request = objectStore.delete(key);

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      resolve();
    };

    return promise;
  }

  function keys(store: StoreKey<S>): Promise<IterableIterator<string>> {
    const [resolve, reject, promise] = deferred<IterableIterator<string>>();

    const objectStore = openStore(store);
    const request = objectStore.getAllKeys();

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      const rawKeys = arrayToIterator(request.result);
      const stringKeys = transformIterator(rawKeys, (k) => k.toString());
      resolve(stringKeys);
    };

    return promise;
  }

  function values<Store extends StoreKey<S>>(store: Store): Promise<IterableIterator<S[Store]>> {
    const [resolve, reject, promise] = deferred<IterableIterator<S[Store]>>();

    const objectStore = openStore(store);
    const request = objectStore.getAll();

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      resolve(arrayToIterator(request.result));
    };

    return promise;
  }

  async function entries<Store extends StoreKey<S>>(store: Store): Promise<IterableIterator<[string, S[Store]]>> {
    const [keyIterator, valueIterator] = await Promise.all([keys(store), values(store)]);
    return mergeIterators(keyIterator, valueIterator);
  }

  return { set, get, remove, keys, values, entries, db };
}
