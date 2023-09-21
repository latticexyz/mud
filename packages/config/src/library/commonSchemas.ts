import { z } from "zod";
import {
  validateBaseRoute,
  validateCapitalizedName,
  validateEthereumAddress,
  validateEnum,
  validateName,
  validateRoute,
  validateSingleLevelRoute,
  validateUncapitalizedName,
  validateNamespace,
} from "./validation";

/** Capitalized names of objects, like tables and systems */
export const zObjectName = z.string().superRefine(validateCapitalizedName);
/** Uncapitalized names of values, like keys and columns */
export const zValueName = z.string().superRefine(validateUncapitalizedName);
/** Name that can start with any case */
export const zName = z.string().superRefine(validateName);
/** A namespace */
export const zNamespace = z.string().superRefine(validateNamespace);

/** List of unique enum member names and 0 < length < 256 */
export const zUserEnum = z.array(zObjectName).superRefine(validateEnum);

/** Ordinary routes */
export const zOrdinaryRoute = z.string().superRefine(validateRoute);
/** Routes with exactly 1 non-empty level */
export const zSingleLevelRoute = z.string().superRefine(validateSingleLevelRoute);
/** Base routes (can be an empty string) */
export const zBaseRoute = z.string().superRefine(validateBaseRoute);

/** A valid Ethereum address */
export const zEthereumAddress = z.string().superRefine(validateEthereumAddress);
