export function validateRoute(route: string, singleLevel?: boolean) {
  const errors: string[] = [];

  if (route[0] !== "/") {
    errors.push(`Route "${route}" must start with "/"`);
  }

  if (route[route.length - 1] === "/") {
    errors.push(`Route "${route}" must not end with "/"`);
  }

  const parts = route.split("/");
  if (singleLevel && parts.length > 2) {
    errors.push(`Route "${route}" must only have one level (e.g. "/foo")`);
  }

  // start at 1 to skip the first empty part
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] === "") {
      errors.push(`Route "${route}" must not contain empty route fragments (e.g. "//")`);
    }

    if (!/^\w+$/.test(parts[i])) {
      errors.push(`Route "${route}" must contain only alphanumeric & underscore characters`);
    }
  }

  return errors;
}
