/**
 * Bar widths for the label barcodes.
 *
 * Two generators share one output shape: a list of module widths that
 * alternate bar, space, bar, space, starting with a bar. `code128Modules`
 * is a real Code 128 (subset B) symbol that a scanner reads. `barcodeModules`
 * is decorative, hashed from a string so the same text always prints the same
 * bars, for places where a real symbol would be too dense to render.
 */

/**
 * Code 128 patterns, values 0 to 106. Each digit is a module width, bars and
 * spaces alternating starting with a bar. 103 to 105 are the start codes and
 * 106 is the stop pattern, which has a seventh element (the final bar).
 */
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
  "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
  "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
  "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
  "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
  "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
  "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
  "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
  "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
  "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
  "211214", "211232", "2331112",
];

const START_B = 104;
const STOP = 106;

/** Quiet zone each side of a Code 128 symbol, in modules. The spec minimum is 10. */
export const CODE128_QUIET_ZONE = 10;

/**
 * Code 128 subset B symbol values for `text`: start code, one value per
 * character, then the modulo 103 check value and the stop code. Subset B
 * covers printable ASCII 32 to 126, which is all a domain or URL needs.
 */
export function code128Values(text: string): number[] {
  const values = [START_B];
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 32 || code > 126) {
      throw new Error(`Code 128 B cannot encode character ${JSON.stringify(text[i])}`);
    }
    values.push(code - 32);
  }
  let check = START_B;
  for (let i = 1; i < values.length; i += 1) check += values[i] * i;
  values.push(check % 103, STOP);
  return values;
}

/**
 * Module widths for a scannable Code 128 B symbol. The list starts and ends
 * with a bar; the caller adds `CODE128_QUIET_ZONE` blank modules on each side.
 */
export function code128Modules(text: string): number[] {
  return code128Values(text).flatMap((value) =>
    CODE128_PATTERNS[value].split("").map(Number),
  );
}

/**
 * Decorative bars derived from a string. Not a symbology and not scannable.
 * Deterministic, with widths one to four modules wide to match the Code 128
 * look, for share cards where a real symbol for a long title would be too fine.
 */
export function barcodeModules(text: string, count = 60): number[] {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const widths: number[] = [2, 1, 1]; // start guard
  for (let i = 0; i < count; i += 1) {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    widths.push(1 + ((hash >>> 0) % 4));
  }
  widths.push(1, 1, 2); // stop guard
  return widths;
}
