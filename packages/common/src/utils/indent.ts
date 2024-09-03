export function indent(message: string, indentation = "  "): string {
  return message.replaceAll(/(^|\n)/g, `$1${indentation}`);
}
