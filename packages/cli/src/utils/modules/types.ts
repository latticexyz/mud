export type Module = {
  name: string;
  root: boolean;
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
