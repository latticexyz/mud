import { Component } from "@latticexyz/recs";

export function getComponentName(component: Component): string {
  return String(component.metadata?.tableName ?? component.metadata?.componentName ?? component.id);
}
