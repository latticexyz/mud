// src/config/commonSchemas.ts
import { z } from "zod";

// src/config/validation.ts
import { ethers } from "ethers";
import { ZodIssueCode } from "zod";
function validateName(name, ctx) {
  if (!/^\w+$/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Name must contain only alphanumeric & underscore characters`
    });
  }
}
function validateCapitalizedName(name, ctx) {
  validateName(name, ctx);
  if (!/^[A-Z]/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Name must start with a capital letter`
    });
  }
}
function validateUncapitalizedName(name, ctx) {
  validateName(name, ctx);
  if (!/^[a-z]/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Name must start with a lowercase letter`
    });
  }
}
function validateEnum(members, ctx) {
  if (members.length === 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Enum must not be empty`
    });
  }
  if (members.length >= 256) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Length of enum must be < 256`
    });
  }
  const duplicates = getDuplicates(members);
  if (duplicates.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Enum must not have duplicate names for: ${duplicates.join(", ")}`
    });
  }
}
function _factoryForValidateRoute(requireNonEmpty, requireSingleLevel) {
  return (route, ctx) => {
    if (route === "") {
      if (requireNonEmpty) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Route must not be empty`
        });
      }
      return;
    }
    if (route[0] !== "/") {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Route must start with "/"`
      });
    }
    if (route[route.length - 1] === "/") {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Route must not end with "/"`
      });
    }
    const parts = route.split("/");
    if (requireSingleLevel && parts.length > 2) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Route must only have one level (e.g. "/foo")`
      });
    }
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === "") {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Route must not contain empty route fragments (e.g. "//")`
        });
      }
      if (!/^\w+$/.test(parts[i])) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Route must contain only alphanumeric & underscore characters`
        });
      }
    }
  };
}
var validateRoute = _factoryForValidateRoute(true, false);
var validateBaseRoute = _factoryForValidateRoute(false, false);
var validateSingleLevelRoute = _factoryForValidateRoute(true, true);
function validateEthereumAddress(address, ctx) {
  if (!ethers.utils.isAddress(address)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Address must be a valid Ethereum address`
    });
  }
}
function getDuplicates(array) {
  const checked = /* @__PURE__ */ new Set();
  const duplicates = /* @__PURE__ */ new Set();
  for (const element of array) {
    if (checked.has(element)) {
      duplicates.add(element);
    }
    checked.add(element);
  }
  return [...duplicates];
}
function validateSelector(name, ctx) {
  if (name.length > 16) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Selector must be <= 16 characters`
    });
  }
  if (!/^\w*$/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Selector must contain only alphanumeric & underscore characters`
    });
  }
}
function parseStaticArray(abiType) {
  const matches = abiType.match(/^(\w+)\[(\d+)\]$/);
  if (!matches)
    return null;
  return {
    elementType: matches[1],
    staticLength: Number.parseInt(matches[2])
  };
}

// src/config/commonSchemas.ts
var zObjectName = z.string().superRefine(validateCapitalizedName);
var zValueName = z.string().superRefine(validateUncapitalizedName);
var zAnyCaseName = z.string().superRefine(validateName);
var zUserEnum = z.array(zObjectName).superRefine(validateEnum);
var zOrdinaryRoute = z.string().superRefine(validateRoute);
var zSingleLevelRoute = z.string().superRefine(validateSingleLevelRoute);
var zBaseRoute = z.string().superRefine(validateBaseRoute);
var zEthereumAddress = z.string().superRefine(validateEthereumAddress);
var zSelector = z.string().superRefine(validateSelector);

// src/config/loadConfig.ts
import { findUp } from "find-up";
import path from "path";

// src/utils/errors.ts
import chalk from "chalk";
import { z as z2, ZodError, ZodIssueCode as ZodIssueCode2 } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";
function fromZodErrorCustom(error, prefix) {
  return fromZodError(error, {
    prefix: chalk.red(prefix),
    prefixSeparator: "\n- ",
    issueSeparator: "\n- "
  });
}
var NotInsideProjectError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "NotInsideProjectError";
    this.message = "You are not inside a MUD project";
  }
};
var NotESMConfigError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "NotESMConfigError";
    this.message = "MUD config must be an ES module";
  }
};
var MUDError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "MUDError";
  }
};
function UnrecognizedSystemErrorFactory(path2, systemName) {
  return new z2.ZodError([{ code: ZodIssueCode2.custom, path: path2, message: `Unrecognized system: "${systemName}"` }]);
}
function logError(error) {
  if (error instanceof ValidationError) {
    console.log(chalk.redBright(error.message));
  } else if (error instanceof ZodError) {
    const validationError = fromZodError(error, {
      prefixSeparator: "\n- ",
      issueSeparator: "\n- "
    });
    console.log(chalk.redBright(validationError.message));
  } else if (error instanceof NotInsideProjectError) {
    console.log(chalk.red(error.message));
    console.log("");
    console.log(chalk.blue(`To learn more about MUD's configuration, please go to https://mud.dev/packages/cli/`));
  } else if (error instanceof NotESMConfigError) {
    console.log(chalk.red(error.message));
    console.log("");
    console.log(
      chalk.blue(`Please name your config file \`mud.config.mts\`, or use \`type: "module"\` in package.json`)
    );
  } else if (error instanceof MUDError) {
    console.log(chalk.red(error));
  } else {
    console.log(error);
  }
}

// src/config/loadConfig.ts
var configFiles = ["mud.config.ts", "mud.config.mts"];
async function loadConfig(configPath) {
  configPath = await resolveConfigPath(configPath);
  try {
    return (await import(configPath)).default;
  } catch (error) {
    if (error instanceof SyntaxError && error.message === "Cannot use import statement outside a module") {
      throw new NotESMConfigError();
    } else {
      throw error;
    }
  }
}
async function resolveConfigPath(configPath) {
  if (configPath === void 0) {
    configPath = await getUserConfigPath();
  } else {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(process.cwd(), configPath);
      configPath = path.normalize(configPath);
    }
  }
  return configPath;
}
async function getUserConfigPath() {
  const tsConfigPath = await findUp(configFiles);
  if (tsConfigPath === void 0) {
    throw new NotInsideProjectError();
  }
  return tsConfigPath;
}

// src/config/loadStoreConfig.ts
import { ZodError as ZodError2 } from "zod";

// ../schema-type/src/typescript/SchemaType.ts
var SchemaType = /* @__PURE__ */ ((SchemaType2) => {
  SchemaType2[SchemaType2["UINT8"] = 0] = "UINT8";
  SchemaType2[SchemaType2["UINT16"] = 1] = "UINT16";
  SchemaType2[SchemaType2["UINT24"] = 2] = "UINT24";
  SchemaType2[SchemaType2["UINT32"] = 3] = "UINT32";
  SchemaType2[SchemaType2["UINT40"] = 4] = "UINT40";
  SchemaType2[SchemaType2["UINT48"] = 5] = "UINT48";
  SchemaType2[SchemaType2["UINT56"] = 6] = "UINT56";
  SchemaType2[SchemaType2["UINT64"] = 7] = "UINT64";
  SchemaType2[SchemaType2["UINT72"] = 8] = "UINT72";
  SchemaType2[SchemaType2["UINT80"] = 9] = "UINT80";
  SchemaType2[SchemaType2["UINT88"] = 10] = "UINT88";
  SchemaType2[SchemaType2["UINT96"] = 11] = "UINT96";
  SchemaType2[SchemaType2["UINT104"] = 12] = "UINT104";
  SchemaType2[SchemaType2["UINT112"] = 13] = "UINT112";
  SchemaType2[SchemaType2["UINT120"] = 14] = "UINT120";
  SchemaType2[SchemaType2["UINT128"] = 15] = "UINT128";
  SchemaType2[SchemaType2["UINT136"] = 16] = "UINT136";
  SchemaType2[SchemaType2["UINT144"] = 17] = "UINT144";
  SchemaType2[SchemaType2["UINT152"] = 18] = "UINT152";
  SchemaType2[SchemaType2["UINT160"] = 19] = "UINT160";
  SchemaType2[SchemaType2["UINT168"] = 20] = "UINT168";
  SchemaType2[SchemaType2["UINT176"] = 21] = "UINT176";
  SchemaType2[SchemaType2["UINT184"] = 22] = "UINT184";
  SchemaType2[SchemaType2["UINT192"] = 23] = "UINT192";
  SchemaType2[SchemaType2["UINT200"] = 24] = "UINT200";
  SchemaType2[SchemaType2["UINT208"] = 25] = "UINT208";
  SchemaType2[SchemaType2["UINT216"] = 26] = "UINT216";
  SchemaType2[SchemaType2["UINT224"] = 27] = "UINT224";
  SchemaType2[SchemaType2["UINT232"] = 28] = "UINT232";
  SchemaType2[SchemaType2["UINT240"] = 29] = "UINT240";
  SchemaType2[SchemaType2["UINT248"] = 30] = "UINT248";
  SchemaType2[SchemaType2["UINT256"] = 31] = "UINT256";
  SchemaType2[SchemaType2["INT8"] = 32] = "INT8";
  SchemaType2[SchemaType2["INT16"] = 33] = "INT16";
  SchemaType2[SchemaType2["INT24"] = 34] = "INT24";
  SchemaType2[SchemaType2["INT32"] = 35] = "INT32";
  SchemaType2[SchemaType2["INT40"] = 36] = "INT40";
  SchemaType2[SchemaType2["INT48"] = 37] = "INT48";
  SchemaType2[SchemaType2["INT56"] = 38] = "INT56";
  SchemaType2[SchemaType2["INT64"] = 39] = "INT64";
  SchemaType2[SchemaType2["INT72"] = 40] = "INT72";
  SchemaType2[SchemaType2["INT80"] = 41] = "INT80";
  SchemaType2[SchemaType2["INT88"] = 42] = "INT88";
  SchemaType2[SchemaType2["INT96"] = 43] = "INT96";
  SchemaType2[SchemaType2["INT104"] = 44] = "INT104";
  SchemaType2[SchemaType2["INT112"] = 45] = "INT112";
  SchemaType2[SchemaType2["INT120"] = 46] = "INT120";
  SchemaType2[SchemaType2["INT128"] = 47] = "INT128";
  SchemaType2[SchemaType2["INT136"] = 48] = "INT136";
  SchemaType2[SchemaType2["INT144"] = 49] = "INT144";
  SchemaType2[SchemaType2["INT152"] = 50] = "INT152";
  SchemaType2[SchemaType2["INT160"] = 51] = "INT160";
  SchemaType2[SchemaType2["INT168"] = 52] = "INT168";
  SchemaType2[SchemaType2["INT176"] = 53] = "INT176";
  SchemaType2[SchemaType2["INT184"] = 54] = "INT184";
  SchemaType2[SchemaType2["INT192"] = 55] = "INT192";
  SchemaType2[SchemaType2["INT200"] = 56] = "INT200";
  SchemaType2[SchemaType2["INT208"] = 57] = "INT208";
  SchemaType2[SchemaType2["INT216"] = 58] = "INT216";
  SchemaType2[SchemaType2["INT224"] = 59] = "INT224";
  SchemaType2[SchemaType2["INT232"] = 60] = "INT232";
  SchemaType2[SchemaType2["INT240"] = 61] = "INT240";
  SchemaType2[SchemaType2["INT248"] = 62] = "INT248";
  SchemaType2[SchemaType2["INT256"] = 63] = "INT256";
  SchemaType2[SchemaType2["BYTES1"] = 64] = "BYTES1";
  SchemaType2[SchemaType2["BYTES2"] = 65] = "BYTES2";
  SchemaType2[SchemaType2["BYTES3"] = 66] = "BYTES3";
  SchemaType2[SchemaType2["BYTES4"] = 67] = "BYTES4";
  SchemaType2[SchemaType2["BYTES5"] = 68] = "BYTES5";
  SchemaType2[SchemaType2["BYTES6"] = 69] = "BYTES6";
  SchemaType2[SchemaType2["BYTES7"] = 70] = "BYTES7";
  SchemaType2[SchemaType2["BYTES8"] = 71] = "BYTES8";
  SchemaType2[SchemaType2["BYTES9"] = 72] = "BYTES9";
  SchemaType2[SchemaType2["BYTES10"] = 73] = "BYTES10";
  SchemaType2[SchemaType2["BYTES11"] = 74] = "BYTES11";
  SchemaType2[SchemaType2["BYTES12"] = 75] = "BYTES12";
  SchemaType2[SchemaType2["BYTES13"] = 76] = "BYTES13";
  SchemaType2[SchemaType2["BYTES14"] = 77] = "BYTES14";
  SchemaType2[SchemaType2["BYTES15"] = 78] = "BYTES15";
  SchemaType2[SchemaType2["BYTES16"] = 79] = "BYTES16";
  SchemaType2[SchemaType2["BYTES17"] = 80] = "BYTES17";
  SchemaType2[SchemaType2["BYTES18"] = 81] = "BYTES18";
  SchemaType2[SchemaType2["BYTES19"] = 82] = "BYTES19";
  SchemaType2[SchemaType2["BYTES20"] = 83] = "BYTES20";
  SchemaType2[SchemaType2["BYTES21"] = 84] = "BYTES21";
  SchemaType2[SchemaType2["BYTES22"] = 85] = "BYTES22";
  SchemaType2[SchemaType2["BYTES23"] = 86] = "BYTES23";
  SchemaType2[SchemaType2["BYTES24"] = 87] = "BYTES24";
  SchemaType2[SchemaType2["BYTES25"] = 88] = "BYTES25";
  SchemaType2[SchemaType2["BYTES26"] = 89] = "BYTES26";
  SchemaType2[SchemaType2["BYTES27"] = 90] = "BYTES27";
  SchemaType2[SchemaType2["BYTES28"] = 91] = "BYTES28";
  SchemaType2[SchemaType2["BYTES29"] = 92] = "BYTES29";
  SchemaType2[SchemaType2["BYTES30"] = 93] = "BYTES30";
  SchemaType2[SchemaType2["BYTES31"] = 94] = "BYTES31";
  SchemaType2[SchemaType2["BYTES32"] = 95] = "BYTES32";
  SchemaType2[SchemaType2["BOOL"] = 96] = "BOOL";
  SchemaType2[SchemaType2["ADDRESS"] = 97] = "ADDRESS";
  SchemaType2[SchemaType2["UINT8_ARRAY"] = 98] = "UINT8_ARRAY";
  SchemaType2[SchemaType2["UINT16_ARRAY"] = 99] = "UINT16_ARRAY";
  SchemaType2[SchemaType2["UINT24_ARRAY"] = 100] = "UINT24_ARRAY";
  SchemaType2[SchemaType2["UINT32_ARRAY"] = 101] = "UINT32_ARRAY";
  SchemaType2[SchemaType2["UINT40_ARRAY"] = 102] = "UINT40_ARRAY";
  SchemaType2[SchemaType2["UINT48_ARRAY"] = 103] = "UINT48_ARRAY";
  SchemaType2[SchemaType2["UINT56_ARRAY"] = 104] = "UINT56_ARRAY";
  SchemaType2[SchemaType2["UINT64_ARRAY"] = 105] = "UINT64_ARRAY";
  SchemaType2[SchemaType2["UINT72_ARRAY"] = 106] = "UINT72_ARRAY";
  SchemaType2[SchemaType2["UINT80_ARRAY"] = 107] = "UINT80_ARRAY";
  SchemaType2[SchemaType2["UINT88_ARRAY"] = 108] = "UINT88_ARRAY";
  SchemaType2[SchemaType2["UINT96_ARRAY"] = 109] = "UINT96_ARRAY";
  SchemaType2[SchemaType2["UINT104_ARRAY"] = 110] = "UINT104_ARRAY";
  SchemaType2[SchemaType2["UINT112_ARRAY"] = 111] = "UINT112_ARRAY";
  SchemaType2[SchemaType2["UINT120_ARRAY"] = 112] = "UINT120_ARRAY";
  SchemaType2[SchemaType2["UINT128_ARRAY"] = 113] = "UINT128_ARRAY";
  SchemaType2[SchemaType2["UINT136_ARRAY"] = 114] = "UINT136_ARRAY";
  SchemaType2[SchemaType2["UINT144_ARRAY"] = 115] = "UINT144_ARRAY";
  SchemaType2[SchemaType2["UINT152_ARRAY"] = 116] = "UINT152_ARRAY";
  SchemaType2[SchemaType2["UINT160_ARRAY"] = 117] = "UINT160_ARRAY";
  SchemaType2[SchemaType2["UINT168_ARRAY"] = 118] = "UINT168_ARRAY";
  SchemaType2[SchemaType2["UINT176_ARRAY"] = 119] = "UINT176_ARRAY";
  SchemaType2[SchemaType2["UINT184_ARRAY"] = 120] = "UINT184_ARRAY";
  SchemaType2[SchemaType2["UINT192_ARRAY"] = 121] = "UINT192_ARRAY";
  SchemaType2[SchemaType2["UINT200_ARRAY"] = 122] = "UINT200_ARRAY";
  SchemaType2[SchemaType2["UINT208_ARRAY"] = 123] = "UINT208_ARRAY";
  SchemaType2[SchemaType2["UINT216_ARRAY"] = 124] = "UINT216_ARRAY";
  SchemaType2[SchemaType2["UINT224_ARRAY"] = 125] = "UINT224_ARRAY";
  SchemaType2[SchemaType2["UINT232_ARRAY"] = 126] = "UINT232_ARRAY";
  SchemaType2[SchemaType2["UINT240_ARRAY"] = 127] = "UINT240_ARRAY";
  SchemaType2[SchemaType2["UINT248_ARRAY"] = 128] = "UINT248_ARRAY";
  SchemaType2[SchemaType2["UINT256_ARRAY"] = 129] = "UINT256_ARRAY";
  SchemaType2[SchemaType2["INT8_ARRAY"] = 130] = "INT8_ARRAY";
  SchemaType2[SchemaType2["INT16_ARRAY"] = 131] = "INT16_ARRAY";
  SchemaType2[SchemaType2["INT24_ARRAY"] = 132] = "INT24_ARRAY";
  SchemaType2[SchemaType2["INT32_ARRAY"] = 133] = "INT32_ARRAY";
  SchemaType2[SchemaType2["INT40_ARRAY"] = 134] = "INT40_ARRAY";
  SchemaType2[SchemaType2["INT48_ARRAY"] = 135] = "INT48_ARRAY";
  SchemaType2[SchemaType2["INT56_ARRAY"] = 136] = "INT56_ARRAY";
  SchemaType2[SchemaType2["INT64_ARRAY"] = 137] = "INT64_ARRAY";
  SchemaType2[SchemaType2["INT72_ARRAY"] = 138] = "INT72_ARRAY";
  SchemaType2[SchemaType2["INT80_ARRAY"] = 139] = "INT80_ARRAY";
  SchemaType2[SchemaType2["INT88_ARRAY"] = 140] = "INT88_ARRAY";
  SchemaType2[SchemaType2["INT96_ARRAY"] = 141] = "INT96_ARRAY";
  SchemaType2[SchemaType2["INT104_ARRAY"] = 142] = "INT104_ARRAY";
  SchemaType2[SchemaType2["INT112_ARRAY"] = 143] = "INT112_ARRAY";
  SchemaType2[SchemaType2["INT120_ARRAY"] = 144] = "INT120_ARRAY";
  SchemaType2[SchemaType2["INT128_ARRAY"] = 145] = "INT128_ARRAY";
  SchemaType2[SchemaType2["INT136_ARRAY"] = 146] = "INT136_ARRAY";
  SchemaType2[SchemaType2["INT144_ARRAY"] = 147] = "INT144_ARRAY";
  SchemaType2[SchemaType2["INT152_ARRAY"] = 148] = "INT152_ARRAY";
  SchemaType2[SchemaType2["INT160_ARRAY"] = 149] = "INT160_ARRAY";
  SchemaType2[SchemaType2["INT168_ARRAY"] = 150] = "INT168_ARRAY";
  SchemaType2[SchemaType2["INT176_ARRAY"] = 151] = "INT176_ARRAY";
  SchemaType2[SchemaType2["INT184_ARRAY"] = 152] = "INT184_ARRAY";
  SchemaType2[SchemaType2["INT192_ARRAY"] = 153] = "INT192_ARRAY";
  SchemaType2[SchemaType2["INT200_ARRAY"] = 154] = "INT200_ARRAY";
  SchemaType2[SchemaType2["INT208_ARRAY"] = 155] = "INT208_ARRAY";
  SchemaType2[SchemaType2["INT216_ARRAY"] = 156] = "INT216_ARRAY";
  SchemaType2[SchemaType2["INT224_ARRAY"] = 157] = "INT224_ARRAY";
  SchemaType2[SchemaType2["INT232_ARRAY"] = 158] = "INT232_ARRAY";
  SchemaType2[SchemaType2["INT240_ARRAY"] = 159] = "INT240_ARRAY";
  SchemaType2[SchemaType2["INT248_ARRAY"] = 160] = "INT248_ARRAY";
  SchemaType2[SchemaType2["INT256_ARRAY"] = 161] = "INT256_ARRAY";
  SchemaType2[SchemaType2["BYTES1_ARRAY"] = 162] = "BYTES1_ARRAY";
  SchemaType2[SchemaType2["BYTES2_ARRAY"] = 163] = "BYTES2_ARRAY";
  SchemaType2[SchemaType2["BYTES3_ARRAY"] = 164] = "BYTES3_ARRAY";
  SchemaType2[SchemaType2["BYTES4_ARRAY"] = 165] = "BYTES4_ARRAY";
  SchemaType2[SchemaType2["BYTES5_ARRAY"] = 166] = "BYTES5_ARRAY";
  SchemaType2[SchemaType2["BYTES6_ARRAY"] = 167] = "BYTES6_ARRAY";
  SchemaType2[SchemaType2["BYTES7_ARRAY"] = 168] = "BYTES7_ARRAY";
  SchemaType2[SchemaType2["BYTES8_ARRAY"] = 169] = "BYTES8_ARRAY";
  SchemaType2[SchemaType2["BYTES9_ARRAY"] = 170] = "BYTES9_ARRAY";
  SchemaType2[SchemaType2["BYTES10_ARRAY"] = 171] = "BYTES10_ARRAY";
  SchemaType2[SchemaType2["BYTES11_ARRAY"] = 172] = "BYTES11_ARRAY";
  SchemaType2[SchemaType2["BYTES12_ARRAY"] = 173] = "BYTES12_ARRAY";
  SchemaType2[SchemaType2["BYTES13_ARRAY"] = 174] = "BYTES13_ARRAY";
  SchemaType2[SchemaType2["BYTES14_ARRAY"] = 175] = "BYTES14_ARRAY";
  SchemaType2[SchemaType2["BYTES15_ARRAY"] = 176] = "BYTES15_ARRAY";
  SchemaType2[SchemaType2["BYTES16_ARRAY"] = 177] = "BYTES16_ARRAY";
  SchemaType2[SchemaType2["BYTES17_ARRAY"] = 178] = "BYTES17_ARRAY";
  SchemaType2[SchemaType2["BYTES18_ARRAY"] = 179] = "BYTES18_ARRAY";
  SchemaType2[SchemaType2["BYTES19_ARRAY"] = 180] = "BYTES19_ARRAY";
  SchemaType2[SchemaType2["BYTES20_ARRAY"] = 181] = "BYTES20_ARRAY";
  SchemaType2[SchemaType2["BYTES21_ARRAY"] = 182] = "BYTES21_ARRAY";
  SchemaType2[SchemaType2["BYTES22_ARRAY"] = 183] = "BYTES22_ARRAY";
  SchemaType2[SchemaType2["BYTES23_ARRAY"] = 184] = "BYTES23_ARRAY";
  SchemaType2[SchemaType2["BYTES24_ARRAY"] = 185] = "BYTES24_ARRAY";
  SchemaType2[SchemaType2["BYTES25_ARRAY"] = 186] = "BYTES25_ARRAY";
  SchemaType2[SchemaType2["BYTES26_ARRAY"] = 187] = "BYTES26_ARRAY";
  SchemaType2[SchemaType2["BYTES27_ARRAY"] = 188] = "BYTES27_ARRAY";
  SchemaType2[SchemaType2["BYTES28_ARRAY"] = 189] = "BYTES28_ARRAY";
  SchemaType2[SchemaType2["BYTES29_ARRAY"] = 190] = "BYTES29_ARRAY";
  SchemaType2[SchemaType2["BYTES30_ARRAY"] = 191] = "BYTES30_ARRAY";
  SchemaType2[SchemaType2["BYTES31_ARRAY"] = 192] = "BYTES31_ARRAY";
  SchemaType2[SchemaType2["BYTES32_ARRAY"] = 193] = "BYTES32_ARRAY";
  SchemaType2[SchemaType2["BOOL_ARRAY"] = 194] = "BOOL_ARRAY";
  SchemaType2[SchemaType2["ADDRESS_ARRAY"] = 195] = "ADDRESS_ARRAY";
  SchemaType2[SchemaType2["BYTES"] = 196] = "BYTES";
  SchemaType2[SchemaType2["STRING"] = 197] = "STRING";
  return SchemaType2;
})(SchemaType || {});

// ../schema-type/src/typescript/getStaticByteLength.ts
function getStaticByteLength(schemaType) {
  const val = schemaType.valueOf();
  if (val < 32) {
    return val + 1;
  } else if (val < 64) {
    return val + 1 - 32;
  } else if (val < 96) {
    return val + 1 - 64;
  }
  if (schemaType == 96 /* BOOL */) {
    return 1;
  } else if (schemaType == 97 /* ADDRESS */) {
    return 20;
  }
  return 0;
}

// ../schema-type/src/typescript/encodeSchema.ts
function encodeSchema(schema) {
  if (schema.length > 28)
    throw new Error("Schema can only have up to 28 fields");
  const encodedSchema = new Uint8Array(32);
  let length = 0;
  let staticFields = 0;
  let hasDynamicFields = false;
  for (let i = 0; i < schema.length; i++) {
    const staticByteLength = getStaticByteLength(schema[i]);
    if (staticByteLength > 0) {
      if (hasDynamicFields)
        throw new Error("Static fields must come before dynamic fields in the schema");
      staticFields++;
    } else {
      hasDynamicFields = true;
    }
    length += staticByteLength;
    encodedSchema[i + 4] = schema[i];
  }
  const dynamicFields = schema.length - staticFields;
  if (dynamicFields > 14)
    throw new Error("Schema can only have up to 14 dynamic fields");
  new DataView(encodedSchema.buffer).setUint16(0, length);
  encodedSchema[2] = staticFields;
  encodedSchema[3] = dynamicFields;
  return encodedSchema;
}

// ../schema-type/src/typescript/SchemaTypeArrayToElement.ts
var SchemaTypeArrayToElement = {
  [98 /* UINT8_ARRAY */]: 0 /* UINT8 */,
  [99 /* UINT16_ARRAY */]: 1 /* UINT16 */,
  [100 /* UINT24_ARRAY */]: 2 /* UINT24 */,
  [101 /* UINT32_ARRAY */]: 3 /* UINT32 */,
  [102 /* UINT40_ARRAY */]: 4 /* UINT40 */,
  [103 /* UINT48_ARRAY */]: 5 /* UINT48 */,
  [104 /* UINT56_ARRAY */]: 6 /* UINT56 */,
  [105 /* UINT64_ARRAY */]: 7 /* UINT64 */,
  [106 /* UINT72_ARRAY */]: 8 /* UINT72 */,
  [107 /* UINT80_ARRAY */]: 9 /* UINT80 */,
  [108 /* UINT88_ARRAY */]: 10 /* UINT88 */,
  [109 /* UINT96_ARRAY */]: 11 /* UINT96 */,
  [110 /* UINT104_ARRAY */]: 12 /* UINT104 */,
  [111 /* UINT112_ARRAY */]: 13 /* UINT112 */,
  [112 /* UINT120_ARRAY */]: 14 /* UINT120 */,
  [113 /* UINT128_ARRAY */]: 15 /* UINT128 */,
  [114 /* UINT136_ARRAY */]: 16 /* UINT136 */,
  [115 /* UINT144_ARRAY */]: 17 /* UINT144 */,
  [116 /* UINT152_ARRAY */]: 18 /* UINT152 */,
  [117 /* UINT160_ARRAY */]: 19 /* UINT160 */,
  [118 /* UINT168_ARRAY */]: 20 /* UINT168 */,
  [119 /* UINT176_ARRAY */]: 21 /* UINT176 */,
  [120 /* UINT184_ARRAY */]: 22 /* UINT184 */,
  [121 /* UINT192_ARRAY */]: 23 /* UINT192 */,
  [122 /* UINT200_ARRAY */]: 24 /* UINT200 */,
  [123 /* UINT208_ARRAY */]: 25 /* UINT208 */,
  [124 /* UINT216_ARRAY */]: 26 /* UINT216 */,
  [125 /* UINT224_ARRAY */]: 27 /* UINT224 */,
  [126 /* UINT232_ARRAY */]: 28 /* UINT232 */,
  [127 /* UINT240_ARRAY */]: 29 /* UINT240 */,
  [128 /* UINT248_ARRAY */]: 30 /* UINT248 */,
  [129 /* UINT256_ARRAY */]: 31 /* UINT256 */,
  [130 /* INT8_ARRAY */]: 32 /* INT8 */,
  [131 /* INT16_ARRAY */]: 33 /* INT16 */,
  [132 /* INT24_ARRAY */]: 34 /* INT24 */,
  [133 /* INT32_ARRAY */]: 35 /* INT32 */,
  [134 /* INT40_ARRAY */]: 36 /* INT40 */,
  [135 /* INT48_ARRAY */]: 37 /* INT48 */,
  [136 /* INT56_ARRAY */]: 38 /* INT56 */,
  [137 /* INT64_ARRAY */]: 39 /* INT64 */,
  [138 /* INT72_ARRAY */]: 40 /* INT72 */,
  [139 /* INT80_ARRAY */]: 41 /* INT80 */,
  [140 /* INT88_ARRAY */]: 42 /* INT88 */,
  [141 /* INT96_ARRAY */]: 43 /* INT96 */,
  [142 /* INT104_ARRAY */]: 44 /* INT104 */,
  [143 /* INT112_ARRAY */]: 45 /* INT112 */,
  [144 /* INT120_ARRAY */]: 46 /* INT120 */,
  [145 /* INT128_ARRAY */]: 47 /* INT128 */,
  [146 /* INT136_ARRAY */]: 48 /* INT136 */,
  [147 /* INT144_ARRAY */]: 49 /* INT144 */,
  [148 /* INT152_ARRAY */]: 50 /* INT152 */,
  [149 /* INT160_ARRAY */]: 51 /* INT160 */,
  [150 /* INT168_ARRAY */]: 52 /* INT168 */,
  [151 /* INT176_ARRAY */]: 53 /* INT176 */,
  [152 /* INT184_ARRAY */]: 54 /* INT184 */,
  [153 /* INT192_ARRAY */]: 55 /* INT192 */,
  [154 /* INT200_ARRAY */]: 56 /* INT200 */,
  [155 /* INT208_ARRAY */]: 57 /* INT208 */,
  [156 /* INT216_ARRAY */]: 58 /* INT216 */,
  [157 /* INT224_ARRAY */]: 59 /* INT224 */,
  [158 /* INT232_ARRAY */]: 60 /* INT232 */,
  [159 /* INT240_ARRAY */]: 61 /* INT240 */,
  [160 /* INT248_ARRAY */]: 62 /* INT248 */,
  [161 /* INT256_ARRAY */]: 63 /* INT256 */,
  [162 /* BYTES1_ARRAY */]: 64 /* BYTES1 */,
  [163 /* BYTES2_ARRAY */]: 65 /* BYTES2 */,
  [164 /* BYTES3_ARRAY */]: 66 /* BYTES3 */,
  [165 /* BYTES4_ARRAY */]: 67 /* BYTES4 */,
  [166 /* BYTES5_ARRAY */]: 68 /* BYTES5 */,
  [167 /* BYTES6_ARRAY */]: 69 /* BYTES6 */,
  [168 /* BYTES7_ARRAY */]: 70 /* BYTES7 */,
  [169 /* BYTES8_ARRAY */]: 71 /* BYTES8 */,
  [170 /* BYTES9_ARRAY */]: 72 /* BYTES9 */,
  [171 /* BYTES10_ARRAY */]: 73 /* BYTES10 */,
  [172 /* BYTES11_ARRAY */]: 74 /* BYTES11 */,
  [173 /* BYTES12_ARRAY */]: 75 /* BYTES12 */,
  [174 /* BYTES13_ARRAY */]: 76 /* BYTES13 */,
  [175 /* BYTES14_ARRAY */]: 77 /* BYTES14 */,
  [176 /* BYTES15_ARRAY */]: 78 /* BYTES15 */,
  [177 /* BYTES16_ARRAY */]: 79 /* BYTES16 */,
  [178 /* BYTES17_ARRAY */]: 80 /* BYTES17 */,
  [179 /* BYTES18_ARRAY */]: 81 /* BYTES18 */,
  [180 /* BYTES19_ARRAY */]: 82 /* BYTES19 */,
  [181 /* BYTES20_ARRAY */]: 83 /* BYTES20 */,
  [182 /* BYTES21_ARRAY */]: 84 /* BYTES21 */,
  [183 /* BYTES22_ARRAY */]: 85 /* BYTES22 */,
  [184 /* BYTES23_ARRAY */]: 86 /* BYTES23 */,
  [185 /* BYTES24_ARRAY */]: 87 /* BYTES24 */,
  [186 /* BYTES25_ARRAY */]: 88 /* BYTES25 */,
  [187 /* BYTES26_ARRAY */]: 89 /* BYTES26 */,
  [188 /* BYTES27_ARRAY */]: 90 /* BYTES27 */,
  [189 /* BYTES28_ARRAY */]: 91 /* BYTES28 */,
  [190 /* BYTES29_ARRAY */]: 92 /* BYTES29 */,
  [191 /* BYTES30_ARRAY */]: 93 /* BYTES30 */,
  [192 /* BYTES31_ARRAY */]: 94 /* BYTES31 */,
  [193 /* BYTES32_ARRAY */]: 95 /* BYTES32 */,
  [194 /* BOOL_ARRAY */]: 96 /* BOOL */,
  [195 /* ADDRESS_ARRAY */]: 97 /* ADDRESS */
};

// ../schema-type/src/typescript/SchemaTypeToAbiType.ts
var SchemaTypeToAbiType = {
  [0 /* UINT8 */]: "uint8",
  [1 /* UINT16 */]: "uint16",
  [2 /* UINT24 */]: "uint24",
  [3 /* UINT32 */]: "uint32",
  [4 /* UINT40 */]: "uint40",
  [5 /* UINT48 */]: "uint48",
  [6 /* UINT56 */]: "uint56",
  [7 /* UINT64 */]: "uint64",
  [8 /* UINT72 */]: "uint72",
  [9 /* UINT80 */]: "uint80",
  [10 /* UINT88 */]: "uint88",
  [11 /* UINT96 */]: "uint96",
  [12 /* UINT104 */]: "uint104",
  [13 /* UINT112 */]: "uint112",
  [14 /* UINT120 */]: "uint120",
  [15 /* UINT128 */]: "uint128",
  [16 /* UINT136 */]: "uint136",
  [17 /* UINT144 */]: "uint144",
  [18 /* UINT152 */]: "uint152",
  [19 /* UINT160 */]: "uint160",
  [20 /* UINT168 */]: "uint168",
  [21 /* UINT176 */]: "uint176",
  [22 /* UINT184 */]: "uint184",
  [23 /* UINT192 */]: "uint192",
  [24 /* UINT200 */]: "uint200",
  [25 /* UINT208 */]: "uint208",
  [26 /* UINT216 */]: "uint216",
  [27 /* UINT224 */]: "uint224",
  [28 /* UINT232 */]: "uint232",
  [29 /* UINT240 */]: "uint240",
  [30 /* UINT248 */]: "uint248",
  [31 /* UINT256 */]: "uint256",
  [32 /* INT8 */]: "int8",
  [33 /* INT16 */]: "int16",
  [34 /* INT24 */]: "int24",
  [35 /* INT32 */]: "int32",
  [36 /* INT40 */]: "int40",
  [37 /* INT48 */]: "int48",
  [38 /* INT56 */]: "int56",
  [39 /* INT64 */]: "int64",
  [40 /* INT72 */]: "int72",
  [41 /* INT80 */]: "int80",
  [42 /* INT88 */]: "int88",
  [43 /* INT96 */]: "int96",
  [44 /* INT104 */]: "int104",
  [45 /* INT112 */]: "int112",
  [46 /* INT120 */]: "int120",
  [47 /* INT128 */]: "int128",
  [48 /* INT136 */]: "int136",
  [49 /* INT144 */]: "int144",
  [50 /* INT152 */]: "int152",
  [51 /* INT160 */]: "int160",
  [52 /* INT168 */]: "int168",
  [53 /* INT176 */]: "int176",
  [54 /* INT184 */]: "int184",
  [55 /* INT192 */]: "int192",
  [56 /* INT200 */]: "int200",
  [57 /* INT208 */]: "int208",
  [58 /* INT216 */]: "int216",
  [59 /* INT224 */]: "int224",
  [60 /* INT232 */]: "int232",
  [61 /* INT240 */]: "int240",
  [62 /* INT248 */]: "int248",
  [63 /* INT256 */]: "int256",
  [64 /* BYTES1 */]: "bytes1",
  [65 /* BYTES2 */]: "bytes2",
  [66 /* BYTES3 */]: "bytes3",
  [67 /* BYTES4 */]: "bytes4",
  [68 /* BYTES5 */]: "bytes5",
  [69 /* BYTES6 */]: "bytes6",
  [70 /* BYTES7 */]: "bytes7",
  [71 /* BYTES8 */]: "bytes8",
  [72 /* BYTES9 */]: "bytes9",
  [73 /* BYTES10 */]: "bytes10",
  [74 /* BYTES11 */]: "bytes11",
  [75 /* BYTES12 */]: "bytes12",
  [76 /* BYTES13 */]: "bytes13",
  [77 /* BYTES14 */]: "bytes14",
  [78 /* BYTES15 */]: "bytes15",
  [79 /* BYTES16 */]: "bytes16",
  [80 /* BYTES17 */]: "bytes17",
  [81 /* BYTES18 */]: "bytes18",
  [82 /* BYTES19 */]: "bytes19",
  [83 /* BYTES20 */]: "bytes20",
  [84 /* BYTES21 */]: "bytes21",
  [85 /* BYTES22 */]: "bytes22",
  [86 /* BYTES23 */]: "bytes23",
  [87 /* BYTES24 */]: "bytes24",
  [88 /* BYTES25 */]: "bytes25",
  [89 /* BYTES26 */]: "bytes26",
  [90 /* BYTES27 */]: "bytes27",
  [91 /* BYTES28 */]: "bytes28",
  [92 /* BYTES29 */]: "bytes29",
  [93 /* BYTES30 */]: "bytes30",
  [94 /* BYTES31 */]: "bytes31",
  [95 /* BYTES32 */]: "bytes32",
  [96 /* BOOL */]: "bool",
  [97 /* ADDRESS */]: "address",
  [98 /* UINT8_ARRAY */]: "uint8[]",
  [99 /* UINT16_ARRAY */]: "uint16[]",
  [100 /* UINT24_ARRAY */]: "uint24[]",
  [101 /* UINT32_ARRAY */]: "uint32[]",
  [102 /* UINT40_ARRAY */]: "uint40[]",
  [103 /* UINT48_ARRAY */]: "uint48[]",
  [104 /* UINT56_ARRAY */]: "uint56[]",
  [105 /* UINT64_ARRAY */]: "uint64[]",
  [106 /* UINT72_ARRAY */]: "uint72[]",
  [107 /* UINT80_ARRAY */]: "uint80[]",
  [108 /* UINT88_ARRAY */]: "uint88[]",
  [109 /* UINT96_ARRAY */]: "uint96[]",
  [110 /* UINT104_ARRAY */]: "uint104[]",
  [111 /* UINT112_ARRAY */]: "uint112[]",
  [112 /* UINT120_ARRAY */]: "uint120[]",
  [113 /* UINT128_ARRAY */]: "uint128[]",
  [114 /* UINT136_ARRAY */]: "uint136[]",
  [115 /* UINT144_ARRAY */]: "uint144[]",
  [116 /* UINT152_ARRAY */]: "uint152[]",
  [117 /* UINT160_ARRAY */]: "uint160[]",
  [118 /* UINT168_ARRAY */]: "uint168[]",
  [119 /* UINT176_ARRAY */]: "uint176[]",
  [120 /* UINT184_ARRAY */]: "uint184[]",
  [121 /* UINT192_ARRAY */]: "uint192[]",
  [122 /* UINT200_ARRAY */]: "uint200[]",
  [123 /* UINT208_ARRAY */]: "uint208[]",
  [124 /* UINT216_ARRAY */]: "uint216[]",
  [125 /* UINT224_ARRAY */]: "uint224[]",
  [126 /* UINT232_ARRAY */]: "uint232[]",
  [127 /* UINT240_ARRAY */]: "uint240[]",
  [128 /* UINT248_ARRAY */]: "uint248[]",
  [129 /* UINT256_ARRAY */]: "uint256[]",
  [130 /* INT8_ARRAY */]: "int8[]",
  [131 /* INT16_ARRAY */]: "int16[]",
  [132 /* INT24_ARRAY */]: "int24[]",
  [133 /* INT32_ARRAY */]: "int32[]",
  [134 /* INT40_ARRAY */]: "int40[]",
  [135 /* INT48_ARRAY */]: "int48[]",
  [136 /* INT56_ARRAY */]: "int56[]",
  [137 /* INT64_ARRAY */]: "int64[]",
  [138 /* INT72_ARRAY */]: "int72[]",
  [139 /* INT80_ARRAY */]: "int80[]",
  [140 /* INT88_ARRAY */]: "int88[]",
  [141 /* INT96_ARRAY */]: "int96[]",
  [142 /* INT104_ARRAY */]: "int104[]",
  [143 /* INT112_ARRAY */]: "int112[]",
  [144 /* INT120_ARRAY */]: "int120[]",
  [145 /* INT128_ARRAY */]: "int128[]",
  [146 /* INT136_ARRAY */]: "int136[]",
  [147 /* INT144_ARRAY */]: "int144[]",
  [148 /* INT152_ARRAY */]: "int152[]",
  [149 /* INT160_ARRAY */]: "int160[]",
  [150 /* INT168_ARRAY */]: "int168[]",
  [151 /* INT176_ARRAY */]: "int176[]",
  [152 /* INT184_ARRAY */]: "int184[]",
  [153 /* INT192_ARRAY */]: "int192[]",
  [154 /* INT200_ARRAY */]: "int200[]",
  [155 /* INT208_ARRAY */]: "int208[]",
  [156 /* INT216_ARRAY */]: "int216[]",
  [157 /* INT224_ARRAY */]: "int224[]",
  [158 /* INT232_ARRAY */]: "int232[]",
  [159 /* INT240_ARRAY */]: "int240[]",
  [160 /* INT248_ARRAY */]: "int248[]",
  [161 /* INT256_ARRAY */]: "int256[]",
  [162 /* BYTES1_ARRAY */]: "bytes1[]",
  [163 /* BYTES2_ARRAY */]: "bytes2[]",
  [164 /* BYTES3_ARRAY */]: "bytes3[]",
  [165 /* BYTES4_ARRAY */]: "bytes4[]",
  [166 /* BYTES5_ARRAY */]: "bytes5[]",
  [167 /* BYTES6_ARRAY */]: "bytes6[]",
  [168 /* BYTES7_ARRAY */]: "bytes7[]",
  [169 /* BYTES8_ARRAY */]: "bytes8[]",
  [170 /* BYTES9_ARRAY */]: "bytes9[]",
  [171 /* BYTES10_ARRAY */]: "bytes10[]",
  [172 /* BYTES11_ARRAY */]: "bytes11[]",
  [173 /* BYTES12_ARRAY */]: "bytes12[]",
  [174 /* BYTES13_ARRAY */]: "bytes13[]",
  [175 /* BYTES14_ARRAY */]: "bytes14[]",
  [176 /* BYTES15_ARRAY */]: "bytes15[]",
  [177 /* BYTES16_ARRAY */]: "bytes16[]",
  [178 /* BYTES17_ARRAY */]: "bytes17[]",
  [179 /* BYTES18_ARRAY */]: "bytes18[]",
  [180 /* BYTES19_ARRAY */]: "bytes19[]",
  [181 /* BYTES20_ARRAY */]: "bytes20[]",
  [182 /* BYTES21_ARRAY */]: "bytes21[]",
  [183 /* BYTES22_ARRAY */]: "bytes22[]",
  [184 /* BYTES23_ARRAY */]: "bytes23[]",
  [185 /* BYTES24_ARRAY */]: "bytes24[]",
  [186 /* BYTES25_ARRAY */]: "bytes25[]",
  [187 /* BYTES26_ARRAY */]: "bytes26[]",
  [188 /* BYTES27_ARRAY */]: "bytes27[]",
  [189 /* BYTES28_ARRAY */]: "bytes28[]",
  [190 /* BYTES29_ARRAY */]: "bytes29[]",
  [191 /* BYTES30_ARRAY */]: "bytes30[]",
  [192 /* BYTES31_ARRAY */]: "bytes31[]",
  [193 /* BYTES32_ARRAY */]: "bytes32[]",
  [194 /* BOOL_ARRAY */]: "bool[]",
  [195 /* ADDRESS_ARRAY */]: "address[]",
  [196 /* BYTES */]: "bytes",
  [197 /* STRING */]: "string"
};

// ../schema-type/src/typescript/AbiTypeToSchemaType.ts
var AbiTypeToSchemaType = Object.fromEntries(
  Object.entries(SchemaTypeToAbiType).map(([schemaType, abiType]) => [abiType, parseInt(schemaType)])
);

// ../schema-type/src/typescript/AbiTypes.ts
var AbiTypes = Object.values(SchemaTypeToAbiType);

// ../schema-type/src/typescript/StaticAbiTypes.ts
var StaticAbiTypes = AbiTypes.filter(
  (abiType) => getStaticByteLength(AbiTypeToSchemaType[abiType]) > 0
);

// src/config/parseStoreConfig.ts
import { z as z3, ZodIssueCode as ZodIssueCode3 } from "zod";
var zTableName = zObjectName;
var zKeyName = zValueName;
var zColumnName = zValueName;
var zUserEnumName = zObjectName;
var zFieldData = z3.string();
var zPrimaryKey = z3.string();
var zPrimaryKeys = z3.record(zKeyName, zPrimaryKey).default({ key: "bytes32" });
var zFullSchemaConfig = z3.record(zColumnName, zFieldData).refine((arg) => Object.keys(arg).length > 0, "Table schema may not be empty");
var zShorthandSchemaConfig = zFieldData.transform((fieldData) => {
  return zFullSchemaConfig.parse({
    value: fieldData
  });
});
var zSchemaConfig = zFullSchemaConfig.or(zShorthandSchemaConfig);
var zFullTableConfig = z3.object({
  directory: z3.string().default("tables"),
  fileSelector: zSelector.optional(),
  tableIdArgument: z3.boolean().default(false),
  storeArgument: z3.boolean().default(false),
  primaryKeys: zPrimaryKeys,
  schema: zSchemaConfig,
  dataStruct: z3.boolean().optional()
}).transform((arg) => {
  if (Object.keys(arg.schema).length === 1) {
    arg.dataStruct ??= false;
  } else {
    arg.dataStruct ??= true;
  }
  return arg;
});
var zShorthandTableConfig = zFieldData.transform((fieldData) => {
  return zFullTableConfig.parse({
    schema: {
      value: fieldData
    }
  });
});
var zTableConfig = zFullTableConfig.or(zShorthandTableConfig);
var zTablesConfig = z3.record(zTableName, zTableConfig).transform((tables) => {
  for (const tableName of Object.keys(tables)) {
    const table = tables[tableName];
    table.fileSelector ??= tableName;
    tables[tableName] = table;
  }
  return tables;
});
var zEnumsConfig = z3.object({
  enums: z3.record(zUserEnumName, zUserEnum).default({})
});
function storeConfig(config) {
  return config;
}
var StoreConfigUnrefined = z3.object({
  namespace: zSelector.default(""),
  storeImportPath: z3.string().default("@latticexyz/store/src/"),
  tables: zTablesConfig,
  userTypesPath: z3.string().default("Types")
}).merge(zEnumsConfig);
var zStoreConfig = StoreConfigUnrefined.superRefine(validateStoreConfig);
function parseStoreConfig(config) {
  return zStoreConfig.parse(config);
}
function validateStoreConfig(config, ctx) {
  for (const table of Object.values(config.tables)) {
    const primaryKeyNames = Object.keys(table.primaryKeys);
    const fieldNames = Object.keys(table.schema);
    const duplicateVariableNames = getDuplicates([...primaryKeyNames, ...fieldNames]);
    if (duplicateVariableNames.length > 0) {
      ctx.addIssue({
        code: ZodIssueCode3.custom,
        message: `Field and primary key names within one table must be unique: ${duplicateVariableNames.join(", ")}`
      });
    }
  }
  const tableNames = Object.keys(config.tables);
  const staticUserTypeNames = Object.keys(config.enums);
  const userTypeNames = staticUserTypeNames;
  const globalNames = [...tableNames, ...userTypeNames];
  const duplicateGlobalNames = getDuplicates(globalNames);
  if (duplicateGlobalNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode3.custom,
      message: `Table, enum names must be globally unique: ${duplicateGlobalNames.join(", ")}`
    });
  }
  for (const table of Object.values(config.tables)) {
    for (const primaryKeyType of Object.values(table.primaryKeys)) {
      validateStaticAbiOrUserType(staticUserTypeNames, primaryKeyType, ctx);
    }
    for (const fieldType of Object.values(table.schema)) {
      validateAbiOrUserType(userTypeNames, staticUserTypeNames, fieldType, ctx);
    }
  }
}
function validateAbiOrUserType(userTypeNames, staticUserTypeNames, type, ctx) {
  if (!AbiTypes.includes(type) && !userTypeNames.includes(type)) {
    const staticArray = parseStaticArray(type);
    if (staticArray) {
      validateStaticArray(staticUserTypeNames, staticArray.elementType, staticArray.staticLength, ctx);
    } else {
      ctx.addIssue({
        code: ZodIssueCode3.custom,
        message: `${type} is not a valid abi type, and is not defined in userTypes`
      });
    }
  }
}
function validateStaticAbiOrUserType(staticUserTypeNames, type, ctx) {
  if (!StaticAbiTypes.includes(type) && !staticUserTypeNames.includes(type)) {
    ctx.addIssue({
      code: ZodIssueCode3.custom,
      message: `${type} is not a static type`
    });
  }
}
function validateStaticArray(staticUserTypeNames, elementType, staticLength, ctx) {
  validateStaticAbiOrUserType(staticUserTypeNames, elementType, ctx);
  if (staticLength === 0) {
    ctx.addIssue({
      code: ZodIssueCode3.custom,
      message: `Static array length must not be 0`
    });
  } else if (staticLength >= 2 ** 16) {
    ctx.addIssue({
      code: ZodIssueCode3.custom,
      message: `Static array length must be less than 2**16`
    });
  }
}

// src/config/loadStoreConfig.ts
async function loadStoreConfig(configPath) {
  const config = await loadConfig(configPath);
  try {
    return parseStoreConfig(config);
  } catch (error) {
    if (error instanceof ZodError2) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
}

// src/config/world/loadWorldConfig.ts
import { ZodError as ZodError3 } from "zod";

// src/config/world/parseWorldConfig.ts
import { z as z4 } from "zod";

// src/config/dynamicResolution.ts
var DynamicResolutionType = /* @__PURE__ */ ((DynamicResolutionType2) => {
  DynamicResolutionType2[DynamicResolutionType2["TABLE_ID"] = 0] = "TABLE_ID";
  DynamicResolutionType2[DynamicResolutionType2["SYSTEM_ADDRESS"] = 1] = "SYSTEM_ADDRESS";
  return DynamicResolutionType2;
})(DynamicResolutionType || {});
function resolveTableId(tableName) {
  return {
    type: 0 /* TABLE_ID */,
    input: tableName
  };
}
function isDynamicResolution(value) {
  return typeof value === "object" && value !== null && "type" in value && "input" in value;
}
async function resolveWithContext(unresolved, context) {
  if (!isDynamicResolution(unresolved))
    return unresolved;
  let resolved = void 0;
  if (unresolved.type === 0 /* TABLE_ID */) {
    const tableId = context.tableIds?.[unresolved.input];
    resolved = tableId && { value: tableId, type: "bytes32" };
  }
  if (resolved === void 0) {
    throw new MUDError(`Could not resolve dynamic resolution: 
${JSON.stringify(unresolved, null, 2)}`);
  }
  return resolved;
}

// src/config/world/parseWorldConfig.ts
var zSystemName = zObjectName;
var zModuleName = zObjectName;
var zSystemAccessList = z4.array(zSystemName.or(zEthereumAddress)).default([]);
var zSystemConfig = z4.intersection(
  z4.object({
    fileSelector: zSelector,
    registerFunctionSelectors: z4.boolean().default(true)
  }),
  z4.discriminatedUnion("openAccess", [
    z4.object({
      openAccess: z4.literal(true)
    }),
    z4.object({
      openAccess: z4.literal(false),
      accessList: zSystemAccessList
    })
  ])
);
var zValueWithType = z4.object({
  value: z4.union([z4.string(), z4.number(), z4.instanceof(Uint8Array)]),
  type: z4.string()
});
var zDynamicResolution = z4.object({ type: z4.nativeEnum(DynamicResolutionType), input: z4.string() });
var zModuleConfig = z4.object({
  name: zModuleName,
  root: z4.boolean().default(false),
  args: z4.array(z4.union([zValueWithType, zDynamicResolution])).default([])
});
var zWorldConfig = z4.object({
  namespace: zSelector.default(""),
  worldContractName: z4.string().optional(),
  overrideSystems: z4.record(zSystemName, zSystemConfig).default({}),
  excludeSystems: z4.array(zSystemName).default([]),
  postDeployScript: z4.string().default("PostDeploy"),
  deploymentInfoDirectory: z4.string().default("."),
  worldgenDirectory: z4.string().default("world"),
  worldImportPath: z4.string().default("@latticexyz/world/src/"),
  modules: z4.array(zModuleConfig).default([])
});
async function parseWorldConfig(config) {
  return zWorldConfig.parse(config);
}

// src/config/world/resolveWorldConfig.ts
function resolveWorldConfig(config, existingContracts) {
  const defaultSystemNames = existingContracts?.filter((name) => name.endsWith("System") && name !== "System" && !name.match(/^I[A-Z]/)) ?? [];
  const overriddenSystemNames = Object.keys(config.overrideSystems);
  if (existingContracts) {
    for (const systemName of overriddenSystemNames) {
      if (!existingContracts.includes(systemName) || systemName === "World") {
        throw UnrecognizedSystemErrorFactory(["overrideSystems", systemName], systemName);
      }
    }
  }
  const systemNames = [.../* @__PURE__ */ new Set([...defaultSystemNames, ...overriddenSystemNames])].filter(
    (name) => !config.excludeSystems.includes(name)
  );
  const resolvedSystems = systemNames.reduce((acc, systemName) => {
    return {
      ...acc,
      [systemName]: resolveSystemConfig(systemName, config.overrideSystems[systemName], existingContracts)
    };
  }, {});
  const { overrideSystems, excludeSystems, ...otherConfig } = config;
  return { ...otherConfig, systems: resolvedSystems };
}
function resolveSystemConfig(systemName, config, existingContracts) {
  const fileSelector = config?.fileSelector ?? systemName;
  const registerFunctionSelectors = config?.registerFunctionSelectors ?? true;
  const openAccess = config?.openAccess ?? true;
  const accessListAddresses = [];
  const accessListSystems = [];
  const accessList = config && !config.openAccess ? config.accessList : [];
  for (const accessListItem of accessList) {
    if (accessListItem.startsWith("0x")) {
      accessListAddresses.push(accessListItem);
    } else {
      if (existingContracts && !existingContracts.includes(accessListItem)) {
        throw UnrecognizedSystemErrorFactory(["overrideSystems", systemName, "accessList"], accessListItem);
      }
      accessListSystems.push(accessListItem);
    }
  }
  return { fileSelector, registerFunctionSelectors, openAccess, accessListAddresses, accessListSystems };
}

// src/config/world/loadWorldConfig.ts
async function loadWorldConfig(configPath, existingContracts) {
  const config = await loadConfig(configPath);
  try {
    const parsedConfig = zWorldConfig.parse(config);
    return resolveWorldConfig(parsedConfig, existingContracts);
  } catch (error) {
    if (error instanceof ZodError3) {
      throw fromZodErrorCustom(error, "WorldConfig Validation Error");
    } else {
      throw error;
    }
  }
}

// src/config/index.ts
function mudConfig(config) {
  return config;
}

export {
  fromZodErrorCustom,
  NotInsideProjectError,
  NotESMConfigError,
  MUDError,
  UnrecognizedSystemErrorFactory,
  logError,
  loadConfig,
  SchemaType,
  getStaticByteLength,
  encodeSchema,
  SchemaTypeArrayToElement,
  SchemaTypeToAbiType,
  AbiTypeToSchemaType,
  validateName,
  validateCapitalizedName,
  validateUncapitalizedName,
  validateEnum,
  validateRoute,
  validateBaseRoute,
  validateSingleLevelRoute,
  validateEthereumAddress,
  getDuplicates,
  validateSelector,
  parseStaticArray,
  zObjectName,
  zValueName,
  zAnyCaseName,
  zUserEnum,
  zOrdinaryRoute,
  zSingleLevelRoute,
  zBaseRoute,
  zEthereumAddress,
  zSelector,
  zSchemaConfig,
  zTableConfig,
  zTablesConfig,
  zEnumsConfig,
  storeConfig,
  zStoreConfig,
  parseStoreConfig,
  loadStoreConfig,
  DynamicResolutionType,
  resolveTableId,
  isDynamicResolution,
  resolveWithContext,
  zWorldConfig,
  parseWorldConfig,
  resolveWorldConfig,
  resolveSystemConfig,
  loadWorldConfig,
  mudConfig
};
