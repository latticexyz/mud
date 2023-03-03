import { z } from "zod";
import {
  validateBaseRoute,
  validateCapitalizedName,
  validateDirectory,
  validateEthereumAddress,
  validateRoute,
  validateSingleLevelRoute,
  validateUncapitalizedName,
} from "./validation.js";

/** Capitalized names of objects, like tables and systems */
export const ObjectName = z.string().superRefine(validateCapitalizedName);
/** Uncapitalized names of values, like keys and columns */
export const ValueName = z.string().superRefine(validateUncapitalizedName);

/** Ordinary routes */
export const OrdinaryRoute = z.string().superRefine(validateRoute);
/** Routes with exactly 1 non-empty level */
export const SingleLevelRoute = z.string().superRefine(validateSingleLevelRoute);
/** Base routes (can be an empty string) */
export const BaseRoute = z.string().superRefine(validateBaseRoute);

/** A directory existing in the user's file system */
export const Directory = z.string().superRefine(validateDirectory);

/** A valid Ethereum address */
export const EthereumAddress = z.string().superRefine(validateEthereumAddress);
