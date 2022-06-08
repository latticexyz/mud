import { deferred } from "@latticexyz/utils";

const indexedDB = self.indexedDB;
const VERSION = 1;

export enum Store {
  ECSEvent = "ECSEvent",
}

type ReturnTypes = {
  [Store.ECSEvent]: string;
};

function initDb() {
  const [resolve, reject, promise] = deferred<IDBDatabase>();

  const request = indexedDB.open("Cache", VERSION);

  // Create store and index
  request.onupgradeneeded = () => {
    const db = request.result;

    for (const store of Object.values(Store)) {
      if (db.objectStoreNames.contains(store)) {
        continue;
      }
      db.createObjectStore(store, { keyPath: "key" });
    }

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };
  };

  return promise;
}

export async function createCache() {
  const db = await initDb();

  function getStore(store: Store) {
    const tx = db.transaction(store, "readwrite");
    return tx.objectStore(store);
  }

  function setItem<S extends Store>(store: S, key: string, value: ReturnTypes[S]) {
    const [resolve, reject, promise] = deferred<void>();

    const objectStore = getStore(store);
    const request = objectStore.put({ key, value });
    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      resolve();
    };

    return promise;
  }

  function getItem<S extends Store>(store: S, key: string) {
    const [resolve, reject, promise] = deferred<ReturnTypes[S] | undefined>();

    const objectStore = getStore(store);
    const request = objectStore.get(key);

    request.onerror = (error) => {
      reject(new Error(JSON.stringify(error)));
    };

    request.onsuccess = () => {
      const item = request.result?.value;
      resolve(item);
    };

    return promise;
  }

  function deleteItem<S extends Store>(store: S, key: string) {
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

  function getKeys<S extends Store>(store: S) {
    const [resolve, reject, promise] = deferred<string[]>();

    const objectStore = getStore(store);
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

  return { setItem, getItem, deleteItem, getKeys };
}
