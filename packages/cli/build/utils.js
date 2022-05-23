"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.deferred = void 0;
const child_process_1 = require("child_process");
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
/**
 * Await execution of bash scripts
 * @param command Bash script to execute
 * @returns Promise that resolves when script finished executing
 */
function exec(command) {
    return __awaiter(this, void 0, void 0, function* () {
        const [resolve, , promise] = deferred();
        const child = (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(error);
                console.error(stderr);
            }
            console.log(stdout);
        });
        child.on("close", () => resolve());
        return promise;
    });
}
exports.exec = exec;
