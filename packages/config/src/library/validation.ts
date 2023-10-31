import { ZodIssueCode, RefinementCtx } from "zod";
import { isAddress } from "viem";

export const STORE_NAME_MAX_LENGTH = 16;
export const STORE_NAMESPACE_MAX_LENGTH = 14;

export function validateName(name: string, ctx: RefinementCtx) {
  if (!/^\w+$/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Name must contain only alphanumeric & underscore characters`,
    });
  }
}

export function validateCapitalizedName(name: string, ctx: RefinementCtx) {
  validateName(name, ctx);

  if (!/^[A-Z]/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Name must start with a capital letter`,
    });
  }
}

export function validateUncapitalizedName(name: string, ctx: RefinementCtx) {
  validateName(name, ctx);

  if (!/^[a-z]/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Name must start with a lowercase letter`,
    });
  }
}

// validates only the enum array, not the names of enum members
export function validateEnum(members: string[], ctx: RefinementCtx) {
  if (members.length === 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Enum must not be empty`,
    });
  }
  if (members.length >= 256) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Length of enum must be < 256`,
    });
  }

  const duplicates = getDuplicates(members);
  if (duplicates.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Enum must not have duplicate names for: ${duplicates.join(", ")}`,
    });
  }
}

function _factoryForValidateRoute(requireNonEmpty: boolean, requireSingleLevel: boolean) {
  return (route: string, ctx: RefinementCtx) => {
    if (route === "") {
      if (requireNonEmpty) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Route must not be empty`,
        });
      }
      // we can skip further validation for empty routes
      return;
    }

    if (route[0] !== "/") {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Route must start with "/"`,
      });
    }

    if (route[route.length - 1] === "/") {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Route must not end with "/"`,
      });
    }

    const parts = route.split("/");
    if (requireSingleLevel && parts.length > 2) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Route must only have one level (e.g. "/foo")`,
      });
    }

    // start at 1 to skip the first empty part
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === "") {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Route must not contain empty route fragments (e.g. "//")`,
        });
      }

      if (!/^\w+$/.test(parts[i])) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Route must contain only alphanumeric & underscore characters`,
        });
      }
    }
  };
}

export const validateRoute = _factoryForValidateRoute(true, false);

export const validateBaseRoute = _factoryForValidateRoute(false, false);

export const validateSingleLevelRoute = _factoryForValidateRoute(true, true);

export function validateEthereumAddress(address: string, ctx: RefinementCtx) {
  if (!isAddress(address)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Address must be a valid Ethereum address`,
    });
  }
}

export function getDuplicates<T>(array: T[]) {
  const checked = new Set<T>();
  const duplicates = new Set<T>();
  for (const element of array) {
    if (checked.has(element)) {
      duplicates.add(element);
    }
    checked.add(element);
  }
  return [...duplicates];
}

export function validateNamespace(name: string, ctx: RefinementCtx) {
  if (name.length > STORE_NAMESPACE_MAX_LENGTH) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Namespace must be <= ${STORE_NAMESPACE_MAX_LENGTH} characters`,
    });
  }
  if (!/^\w*$/.test(name)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Selector must contain only alphanumeric & underscore characters`,
    });
  }
}

/** Returns null if the type does not look like a static array, otherwise element and length data */
export function parseStaticArray(abiType: string) {
  const matches = abiType.match(/^(\w+)\[(\d+)\]$/);
  if (!matches) return null;
  return {
    elementType: matches[1],
    staticLength: Number.parseInt(matches[2]),
  };
}
