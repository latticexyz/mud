import { MUDConfigExtender } from "./core";
import { MUDContextAlreadyCreatedError, MUDContextNotCreatedError } from "./errors";

export type GlobalWithMUDCoreContext = typeof global & {
  __mudCoreContext: MUDCoreContext;
};

export class MUDCoreContext {
  static _global = typeof global === "undefined" ? window.global ?? {} : global;

  public static isCreated(): boolean {
    const globalWithMUDCoreContext = this._global as GlobalWithMUDCoreContext;
    return globalWithMUDCoreContext.__mudCoreContext !== undefined;
  }

  public static createContext(): MUDCoreContext {
    if (this.isCreated()) {
      throw new MUDContextAlreadyCreatedError();
    }
    const globalWithMUDCoreContext = this._global as GlobalWithMUDCoreContext;
    const context = new MUDCoreContext();
    globalWithMUDCoreContext.__mudCoreContext = context;
    return context;
  }

  public static getContext(): MUDCoreContext {
    const globalWithMUDCoreContext = this._global as GlobalWithMUDCoreContext;
    const context = globalWithMUDCoreContext.__mudCoreContext;
    if (context === undefined) {
      throw new MUDContextNotCreatedError();
    }
    return context;
  }

  public readonly configExtenders: MUDConfigExtender[] = [];
}
