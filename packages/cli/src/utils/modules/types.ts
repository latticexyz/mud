export type Module = {
  name: string;
  root: boolean;
  address: string;
  args: (
    | {
        value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        type: string;
      }
    | {
        type: any;
        input: string;
      }
  )[];
};

export type ModuleConfig = Module[];
