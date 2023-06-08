import { MUDConfigExtender, MUDHooks } from "./types";
import { MUDContextAlreadyCreatedError, MUDContextNotCreatedError } from "./errors";
import { defaultHooks } from "./defaultHooks";

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
  // the typecast helps prevent typechecks after type extensions from erroring on defaultHooks not having a key
  public readonly hooks: MUDHooks = defaultHooks as MUDHooks;
}
