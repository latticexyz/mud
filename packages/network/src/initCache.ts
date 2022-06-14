import { arrayToIterator, deferred, mergeIterators, transformIterator } from "@latticexyz/utils";

const indexedDB = self.indexedDB;
const VERSION = 4;

function initStore(db: IDBDatabase, storeId: string) {
  if (!db.objectStoreNames.contains(storeId)) {
    db.createObjectStore(storeId);
  }
}

function initDb(dbId: string, stores: string[], version = VERSION) {
  const [resolve, reject, promise] = deferred<IDBDatabase>();

  const request = indexedDB.open(dbId, version);

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

export async function initCache<S extends Stores>(id: string, stores: StoreKey<S>[]) {
  const db = await initDb(id, stores);

  function getStore(store: StoreKey<S>): IDBObjectStore {
    const tx = db.transaction(store, "readwrite");
    return tx.objectStore(store);
  }

  function set<Store extends StoreKey<S>>(store: Store, key: string, value: S[Store]) {
    const [resolve, reject, promise] = deferred<void>();

    const objectStore = getStore(store);
    const request = objectStore.put(value, key);
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

    const objectStore = getStore(store);
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

    const objectStore = getStore(store);
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

    const objectStore = getStore(store);
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

    const objectStore = getStore(store);
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

  return { set, get, remove, keys, values, entries };
}
