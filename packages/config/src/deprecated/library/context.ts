import { MUDConfigExtender } from "./core";
import { MUDContextAlreadyCreatedError, MUDContextNotCreatedError } from "./errors";

/** @deprecated */
export type GlobalWithMUDCoreContext = typeof global & {
  __mudCoreContext: MUDCoreContext;
};

/** @deprecated */
export class MUDCoreContext {
  /** @deprecated */
  static _global = typeof global === "undefined" ? window.global ?? {} : global;

  /** @deprecated */
  public static isCreated(): boolean {
    const globalWithMUDCoreContext = this._global as GlobalWithMUDCoreContext;
    return globalWithMUDCoreContext.__mudCoreContext !== undefined;
  }

  /** @deprecated */
  public static createContext(): MUDCoreContext {
    if (this.isCreated()) {
      throw new MUDContextAlreadyCreatedError();
    }
    const globalWithMUDCoreContext = this._global as GlobalWithMUDCoreContext;
    const context = new MUDCoreContext();
    globalWithMUDCoreContext.__mudCoreContext = context;
    return context;
  }

  /** @deprecated */
  public static getContext(): MUDCoreContext {
    const globalWithMUDCoreContext = this._global as GlobalWithMUDCoreContext;
    const context = globalWithMUDCoreContext.__mudCoreContext;
    if (context === undefined) {
      throw new MUDContextNotCreatedError();
    }
    return context;
  }

  /** @deprecated */
  public readonly configExtenders: MUDConfigExtender[] = [];
}
