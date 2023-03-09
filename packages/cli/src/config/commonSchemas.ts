import { getStaticByteLength, SchemaType } from "@latticexyz/schema-type";
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
} from "./validation.js";

/** Capitalized names of objects, like tables and systems */
export const ObjectName = z.string().superRefine(validateCapitalizedName);
/** Uncapitalized names of values, like keys and columns */
export const ValueName = z.string().superRefine(validateUncapitalizedName);
/** Name that can start with any case */
export const AnyCaseName = z.string().superRefine(validateName);
/** List of unique enum member names and 0 < length < 256 */
export const UserEnum = z.array(ObjectName).superRefine(validateEnum);

/** Ordinary routes */
export const OrdinaryRoute = z.string().superRefine(validateRoute);
/** Routes with exactly 1 non-empty level */
export const SingleLevelRoute = z.string().superRefine(validateSingleLevelRoute);
/** Base routes (can be an empty string) */
export const BaseRoute = z.string().superRefine(validateBaseRoute);

/** A valid Ethereum address */
export const EthereumAddress = z.string().superRefine(validateEthereumAddress);

/** Static subset of SchemaType enum */
export const StaticSchemaType = z
  .nativeEnum(SchemaType)
  .refine((arg) => getStaticByteLength(arg) > 0, "SchemaType must be static");

export const Selector = AnyCaseName.refine((selector) => selector.length <= 16, "Selector must fit into 16 characters");
