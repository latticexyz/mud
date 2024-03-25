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

/**
 * Capitalized names of objects, like tables and systems
 * @deprecated
 */
export const zObjectName = z.string().superRefine(validateCapitalizedName);
/**
 * Uncapitalized names of values, like keys and columns
 * @deprecated
 */
export const zValueName = z.string().superRefine(validateUncapitalizedName);
/** Name that can start with any case
 * @deprecated
 */
export const zName = z.string().superRefine(validateName);
/** A namespace
 * @deprecated
 */
export const zNamespace = z.string().superRefine(validateNamespace);

/** List of unique enum member names and 0 < length < 256
 * @deprecated
 */
export const zUserEnum = z.array(zObjectName).superRefine(validateEnum);

/** Ordinary routes
 * @deprecated
 */
export const zOrdinaryRoute = z.string().superRefine(validateRoute);
/** Routes with exactly 1 non-empty level
 * @deprecated
 */
export const zSingleLevelRoute = z.string().superRefine(validateSingleLevelRoute);
/** Base routes (can be an empty string)
 * @deprecated
 */
export const zBaseRoute = z.string().superRefine(validateBaseRoute);

/** A valid Ethereum address
 * @deprecated
 */
export const zEthereumAddress = z.string().superRefine(validateEthereumAddress);
