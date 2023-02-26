import { ZodIssueCode, RefinementCtx } from "zod";

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
