import { Store } from "../config/v2";
import { AbiType } from "@latticexyz/config";
import { getUserTypesFilename } from "./getUserTypesFilename";
import { groupBy } from "@latticexyz/common/utils";

export type UserType = {
  readonly type: "enum" | "userType";
  readonly name: string;
  readonly abiType: AbiType;
  /**
   * Import path relative to the root dir or absolute path if importing from a package.
   * Relative paths must start with a `.` to be treated as a relative path.
   */
  readonly importPath: string;
};

export function getUserTypes({ config }: { readonly config: Store }): readonly UserType[] {
  const enums = Object.keys(config.enums).map(
    (name): UserType => ({
      type: "enum",
      name,
      abiType: "uint8",
      importPath: "./" + getUserTypesFilename({ config }),
    }),
  );

  const userTypes = Object.entries(config.userTypes).map(
    ([name, userType]): UserType => ({
      type: "userType",
      name,
      abiType: userType.type,
      // If `userType.filePath` starts with a `.`, it's relative to the root dir
      importPath: userType.filePath,
    }),
  );

  const result = [...enums, ...userTypes];

  // TODO: move this to config validation step?
  const duplicates = Array.from(groupBy(result, (userType) => userType.name).entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([name]) => name);
  if (duplicates.length > 0) {
    throw new Error(`Found enums and user types sharing the same name: ${duplicates.join(", ")}`);
  }

  return result;
}
