import { deferred } from "@latticexyz/utils";

const indexedDB = self.indexedDB;
const VERSION = 4; // TODO: Find a better way to manage the version than hardcoding here

function initStore(db: IDBDatabase, storeId: string) {
  if (!db.objectStoreNames.contains(storeId)) {
    db.createObjectStore(storeId);
  }
}

function initDb(storeId: string) {
  const [resolve, reject, promise] = deferred<IDBDatabase>();

  const request = indexedDB.open("Cache", VERSION);

  // Create store and index
  request.onupgradeneeded = () => {
    const db = request.result;
    initStore(db, storeId);
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

export async function createCache(storeId: string) {
  const db = await initDb(storeId);

  function getStore(): IDBObjectStore {
    const tx = db.transaction(storeId, "readwrite");
    return tx.objectStore(storeId);
  }

  // TODO: make this better by providing a schema when initializing the store, then verifying the schema here
  function set(key: string, value: any) {
    const [resolve, reject, promise] = deferred<void>();

    const objectStore = getStore();
    const request = objectStore.put(value, key);
    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      resolve();
    };

    return promise;
  }

  function get(key: string) {
    const [resolve, reject, promise] = deferred<any | undefined>();

    const objectStore = getStore();
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

  function remove(key: string) {
    const [resolve, reject, promise] = deferred<void>();

    const objectStore = getStore();
    const request = objectStore.delete(key);

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      resolve();
    };

    return promise;
  }

  function keys() {
    const [resolve, reject, promise] = deferred<string[]>();

    const objectStore = getStore();
    const request = objectStore.getAllKeys();

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      const item = request.result.map((k) => k.toString());
      resolve(item);
    };

    return promise;
  }

  // TODO: type this properly
  function values() {
    const [resolve, reject, promise] = deferred<any[]>();

    const objectStore = getStore();
    const request = objectStore.getAll();

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      const item = request.result;
      resolve(item);
    };

    return promise;
  }

  // TODO: turn this into an interator
  async function entries() {
    const [k, v] = await Promise.all([keys(), values()]);
    const e: [string, any][] = [];
    for (let i = 0; i < k.length; i++) {
      e.push([k[i], v[i]]);
    }
    return e;
  }

  return { set, get, remove, keys, values, entries };
}
