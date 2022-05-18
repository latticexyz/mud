"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deferred = void 0;
/**
 * A convenient way to create a promise with resolve and reject functions.
 * @returns Tuple with resolve function, reject function and promise.
 */
function deferred() {
    let resolve = null;
    let reject = null;
    const promise = new Promise((r, rj) => {
        resolve = (t) => r(t);
        reject = (e) => rj(e);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [resolve, reject, promise];
}
exports.deferred = deferred;
