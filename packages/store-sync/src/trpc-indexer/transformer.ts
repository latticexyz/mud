import { DataTransformerOptions } from "@trpc/server";
import { serialize, deserialize } from "wagmi";

export const transformer: DataTransformerOptions = {
  serialize: (data: any) => JSON.parse(serialize(data)),
  deserialize: (data: any) => deserialize(JSON.stringify(data)),
};
