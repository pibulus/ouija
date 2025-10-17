// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/** End-of-line character for POSIX platforms such as macOS and Linux. */ export const LF =
  "\n";
/** End-of-line character for Windows platforms. */ export const CRLF = "\r\n";
/**
 * End-of-line character evaluated for the current platform.
 *
 * @example
 * ```ts
 * import { EOL } from "https://deno.land/std@$STD_VERSION/fs/eol.ts";
 *
 * EOL; // Returns "\n" on POSIX platforms or "\r\n" on Windows
 * ```
 */ export const EOL = Deno?.build.os === "windows" ? CRLF : LF;
const regDetect = /(?:\r?\n)/g;
/**
 * Detect the EOL character for string input.
 * returns null if no newline.
 *
 * @example
 * ```ts
 * import { detect, EOL } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * const CRLFinput = "deno\r\nis not\r\nnode";
 * const Mixedinput = "deno\nis not\r\nnode";
 * const LFinput = "deno\nis not\nnode";
 * const NoNLinput = "deno is not node";
 *
 * detect(LFinput); // output EOL.LF
 * detect(CRLFinput); // output EOL.CRLF
 * detect(Mixedinput); // output EOL.CRLF
 * detect(NoNLinput); // output null
 * ```
 */ export function detect(content) {
  const d = content.match(regDetect);
  if (!d || d.length === 0) {
    return null;
  }
  const hasCRLF = d.some((x) => x === CRLF);
  return hasCRLF ? CRLF : LF;
}
/**
 * Format the file to the targeted EOL.
 *
 * @example
 * ```ts
 * import { LF, format } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * const CRLFinput = "deno\r\nis not\r\nnode";
 *
 * format(CRLFinput, LF); // output "deno\nis not\nnode"
 * ```
 */ export function format(content, eol) {
  return content.replace(regDetect, eol);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL2VvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vKiogRW5kLW9mLWxpbmUgY2hhcmFjdGVyIGZvciBQT1NJWCBwbGF0Zm9ybXMgc3VjaCBhcyBtYWNPUyBhbmQgTGludXguICovXG5leHBvcnQgY29uc3QgTEYgPSBcIlxcblwiIGFzIGNvbnN0O1xuXG4vKiogRW5kLW9mLWxpbmUgY2hhcmFjdGVyIGZvciBXaW5kb3dzIHBsYXRmb3Jtcy4gKi9cbmV4cG9ydCBjb25zdCBDUkxGID0gXCJcXHJcXG5cIiBhcyBjb25zdDtcblxuLyoqXG4gKiBFbmQtb2YtbGluZSBjaGFyYWN0ZXIgZXZhbHVhdGVkIGZvciB0aGUgY3VycmVudCBwbGF0Zm9ybS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IEVPTCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL2VvbC50c1wiO1xuICpcbiAqIEVPTDsgLy8gUmV0dXJucyBcIlxcblwiIG9uIFBPU0lYIHBsYXRmb3JtcyBvciBcIlxcclxcblwiIG9uIFdpbmRvd3NcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgRU9MOiBcIlxcblwiIHwgXCJcXHJcXG5cIiA9IERlbm8/LmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIiA/IENSTEYgOiBMRjtcblxuY29uc3QgcmVnRGV0ZWN0ID0gLyg/Olxccj9cXG4pL2c7XG5cbi8qKlxuICogRGV0ZWN0IHRoZSBFT0wgY2hhcmFjdGVyIGZvciBzdHJpbmcgaW5wdXQuXG4gKiByZXR1cm5zIG51bGwgaWYgbm8gbmV3bGluZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGRldGVjdCwgRU9MIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKlxuICogY29uc3QgQ1JMRmlucHV0ID0gXCJkZW5vXFxyXFxuaXMgbm90XFxyXFxubm9kZVwiO1xuICogY29uc3QgTWl4ZWRpbnB1dCA9IFwiZGVub1xcbmlzIG5vdFxcclxcbm5vZGVcIjtcbiAqIGNvbnN0IExGaW5wdXQgPSBcImRlbm9cXG5pcyBub3RcXG5ub2RlXCI7XG4gKiBjb25zdCBOb05MaW5wdXQgPSBcImRlbm8gaXMgbm90IG5vZGVcIjtcbiAqXG4gKiBkZXRlY3QoTEZpbnB1dCk7IC8vIG91dHB1dCBFT0wuTEZcbiAqIGRldGVjdChDUkxGaW5wdXQpOyAvLyBvdXRwdXQgRU9MLkNSTEZcbiAqIGRldGVjdChNaXhlZGlucHV0KTsgLy8gb3V0cHV0IEVPTC5DUkxGXG4gKiBkZXRlY3QoTm9OTGlucHV0KTsgLy8gb3V0cHV0IG51bGxcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0KGNvbnRlbnQ6IHN0cmluZyk6IHR5cGVvZiBFT0wgfCBudWxsIHtcbiAgY29uc3QgZCA9IGNvbnRlbnQubWF0Y2gocmVnRGV0ZWN0KTtcbiAgaWYgKCFkIHx8IGQubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaGFzQ1JMRiA9IGQuc29tZSgoeDogc3RyaW5nKTogYm9vbGVhbiA9PiB4ID09PSBDUkxGKTtcblxuICByZXR1cm4gaGFzQ1JMRiA/IENSTEYgOiBMRjtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIGZpbGUgdG8gdGhlIHRhcmdldGVkIEVPTC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IExGLCBmb3JtYXQgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9mcy9tb2QudHNcIjtcbiAqXG4gKiBjb25zdCBDUkxGaW5wdXQgPSBcImRlbm9cXHJcXG5pcyBub3RcXHJcXG5ub2RlXCI7XG4gKlxuICogZm9ybWF0KENSTEZpbnB1dCwgTEYpOyAvLyBvdXRwdXQgXCJkZW5vXFxuaXMgbm90XFxubm9kZVwiXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChjb250ZW50OiBzdHJpbmcsIGVvbDogdHlwZW9mIEVPTCk6IHN0cmluZyB7XG4gIHJldHVybiBjb250ZW50LnJlcGxhY2UocmVnRGV0ZWN0LCBlb2wpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSx1RUFBdUUsR0FDdkUsT0FBTyxNQUFNLEtBQUssS0FBYztBQUVoQyxpREFBaUQsR0FDakQsT0FBTyxNQUFNLE9BQU8sT0FBZ0I7QUFFcEM7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBTyxNQUFNLE1BQXFCLE1BQU0sTUFBTSxPQUFPLFlBQVksT0FBTyxHQUFHO0FBRTNFLE1BQU0sWUFBWTtBQUVsQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBa0JDLEdBQ0QsT0FBTyxTQUFTLE9BQU8sT0FBZTtFQUNwQyxNQUFNLElBQUksUUFBUSxLQUFLLENBQUM7RUFDeEIsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUssR0FBRztJQUN4QixPQUFPO0VBQ1Q7RUFDQSxNQUFNLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUF1QixNQUFNO0VBRXJELE9BQU8sVUFBVSxPQUFPO0FBQzFCO0FBRUE7Ozs7Ozs7Ozs7O0NBV0MsR0FDRCxPQUFPLFNBQVMsT0FBTyxPQUFlLEVBQUUsR0FBZTtFQUNyRCxPQUFPLFFBQVEsT0FBTyxDQUFDLFdBQVc7QUFDcEMifQ==
// denoCacheMetadata=17068865731864250028,14305710416682409854
