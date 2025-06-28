// From https://github.com/blakeembrey/change-case/blob/main/packages/change-case/src/index.ts

// Regexps involved with splitting words in various case formats.
const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;

// Regexp involved with stripping non-word characters from the result.
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;

// The replacement value for splits.
const SPLIT_REPLACE_VALUE = "$1\0$2";

// The default characters to keep after transforming case.
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";

/**
 * Supported locale values. Use `false` to ignore locale.
 * Defaults to `undefined`, which uses the host environment.
 */
type Locale = string[] | string | false | undefined;

/**
 * Convert a string to snake case (`foo_bar`).
 */
export function snakeCase(input: string) {
  return noCase(input, "_");
}

/**
 * Split any cased input strings into an array of words.
 */
function split(value: string) {
  let result = value.trim();

  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);

  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");

  let start = 0;
  let end = result.length;

  // Trim the delimiter from around the output string.
  while (result.charAt(start) === "\0") start++;
  if (start === end) return [];
  while (result.charAt(end - 1) === "\0") end--;

  return result.slice(start, end).split(/\0/g);
}

/**
 * Convert a string to space separated lower case (`foo bar`).
 */
function noCase(input: string, delimiter: string) {
  const [prefix, words, suffix] = splitPrefixSuffix(input);
  return prefix + words.map(lowerFactory(undefined)).join(delimiter) + suffix;
}

function lowerFactory(locale: Locale): (input: string) => string {
  return locale === false ? (input: string) => input.toLowerCase() : (input: string) => input.toLocaleLowerCase(locale);
}

function splitPrefixSuffix(input: string): [string, string[], string] {
  const splitFn = split;
  const prefixCharacters = DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;

  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char)) break;
    prefixIndex++;
  }

  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char)) break;
    suffixIndex = index;
  }

  return [input.slice(0, prefixIndex), splitFn(input.slice(prefixIndex, suffixIndex)), input.slice(suffixIndex)];
}
