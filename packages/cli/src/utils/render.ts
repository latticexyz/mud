export type TaggedTemplate = (strings: TemplateStringsArray, ...values: (string | number)[]) => string;

export function zipTaggedTemplate(strings: TemplateStringsArray, ...values: (string | number)[]) {
  let result = strings[0];
  for (const [index, value] of values.entries()) {
    result += value + strings[index + 1];
  }
  return result;
}

/**
 * Tag to conditionally render a template.
 * Note that unlike a real `if`, this tag will *always evaluate* expressions within the template
 */
export function _if(condition: boolean) {
  if (condition) {
    return zipTaggedTemplate;
  } else {
    return () => "";
  }
}

export function renderList<T>(list: T[], renderItem: (item: T, index: number) => string) {
  return internalRenderList("", list, renderItem);
}

export function renderListWithCommas<T>(list: T[], renderItem: (item: T, index: number) => string) {
  return internalRenderList(",", list, renderItem);
}

function internalRenderList<T>(lineTerminator: string, list: T[], renderItem: (item: T, index: number) => string) {
  return list
    .map((item, index) => renderItem(item, index) + (index === list.length - 1 ? "" : lineTerminator))
    .join("\n");
}
