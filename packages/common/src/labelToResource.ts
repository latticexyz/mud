import { ROOT_NAMESPACE } from "./common";

export function labelToResource(label: string): {
  readonly namespace: string;
  readonly name: string;
} {
  const parts = label.split("__");

  if (parts.length === 1) {
    return {
      namespace: ROOT_NAMESPACE,
      name: parts[0],
    };
  } else {
    return {
      namespace: parts[0],
      name: parts[1],
    };
  }
}
