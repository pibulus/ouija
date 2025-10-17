// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/
// This module is browser compatible.
/**
 * Utilities for working with OS-specific file paths.
 *
 * Functions from this module will automatically switch to support the path style
 * of the current OS, either `windows` for Microsoft Windows, or `posix` for
 * every other operating system, eg. Linux, MacOS, BSD etc.
 *
 * To use functions for a specific path style regardless of the current OS
 * import the modules from the platform sub directory instead.
 *
 * Example, for `posix`:
 *
 * ```ts
 * import { fromFileUrl } from "https://deno.land/std@$STD_VERSION/path/posix/from_file_url.ts";
 * const p = fromFileUrl("file:///home/foo");
 * console.log(p); // "/home/foo"
 * ```
 *
 * or, for `windows`:
 *
 * ```ts
 * import { fromFileUrl } from "https://deno.land/std@$STD_VERSION/path/windows/from_file_url.ts";
 * const p = fromFileUrl("file:///home/foo");
 * console.log(p); // "\\home\\foo"
 * ```
 *
 * This module is browser compatible.
 *
 * @module
 */
import { isWindows } from "./_os.ts";
import * as _windows from "./windows/mod.ts";
import * as _posix from "./posix/mod.ts";
/** @deprecated (will be removed after 1.0.0) Import from {@link https://deno.land/std/path/windows/mod.ts} instead. */ export const win32 =
  _windows;
/** @deprecated (will be removed after 1.0.0) Import from {@link https://deno.land/std/posix/mod.ts} instead. */ export const posix =
  _posix;
export const sep = isWindows ? _windows.sep : _posix.sep;
export const delimiter = isWindows ? _windows.delimiter : _posix.delimiter;
export * from "./basename.ts";
export * from "./dirname.ts";
export * from "./extname.ts";
export * from "./format.ts";
export * from "./from_file_url.ts";
export * from "./is_absolute.ts";
export * from "./join.ts";
export * from "./normalize.ts";
export * from "./parse.ts";
export * from "./relative.ts";
export * from "./resolve.ts";
export * from "./to_file_url.ts";
export * from "./to_namespaced_path.ts";
export * from "./common.ts";
export * from "./separator.ts";
export * from "./_interface.ts";
export * from "./glob_to_regexp.ts";
export * from "./is_glob.ts";
export * from "./join_globs.ts";
export * from "./normalize_glob.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwOC4wL3BhdGgvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgdGhlIEJyb3dzZXJpZnkgYXV0aG9ycy4gTUlUIExpY2Vuc2UuXG4vLyBQb3J0ZWQgbW9zdGx5IGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Jyb3dzZXJpZnkvcGF0aC1icm93c2VyaWZ5L1xuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIFV0aWxpdGllcyBmb3Igd29ya2luZyB3aXRoIE9TLXNwZWNpZmljIGZpbGUgcGF0aHMuXG4gKlxuICogRnVuY3Rpb25zIGZyb20gdGhpcyBtb2R1bGUgd2lsbCBhdXRvbWF0aWNhbGx5IHN3aXRjaCB0byBzdXBwb3J0IHRoZSBwYXRoIHN0eWxlXG4gKiBvZiB0aGUgY3VycmVudCBPUywgZWl0aGVyIGB3aW5kb3dzYCBmb3IgTWljcm9zb2Z0IFdpbmRvd3MsIG9yIGBwb3NpeGAgZm9yXG4gKiBldmVyeSBvdGhlciBvcGVyYXRpbmcgc3lzdGVtLCBlZy4gTGludXgsIE1hY09TLCBCU0QgZXRjLlxuICpcbiAqIFRvIHVzZSBmdW5jdGlvbnMgZm9yIGEgc3BlY2lmaWMgcGF0aCBzdHlsZSByZWdhcmRsZXNzIG9mIHRoZSBjdXJyZW50IE9TXG4gKiBpbXBvcnQgdGhlIG1vZHVsZXMgZnJvbSB0aGUgcGxhdGZvcm0gc3ViIGRpcmVjdG9yeSBpbnN0ZWFkLlxuICpcbiAqIEV4YW1wbGUsIGZvciBgcG9zaXhgOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBmcm9tRmlsZVVybCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3BhdGgvcG9zaXgvZnJvbV9maWxlX3VybC50c1wiO1xuICogY29uc3QgcCA9IGZyb21GaWxlVXJsKFwiZmlsZTovLy9ob21lL2Zvb1wiKTtcbiAqIGNvbnNvbGUubG9nKHApOyAvLyBcIi9ob21lL2Zvb1wiXG4gKiBgYGBcbiAqXG4gKiBvciwgZm9yIGB3aW5kb3dzYDpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZnJvbUZpbGVVcmwgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9wYXRoL3dpbmRvd3MvZnJvbV9maWxlX3VybC50c1wiO1xuICogY29uc3QgcCA9IGZyb21GaWxlVXJsKFwiZmlsZTovLy9ob21lL2Zvb1wiKTtcbiAqIGNvbnNvbGUubG9nKHApOyAvLyBcIlxcXFxob21lXFxcXGZvb1wiXG4gKiBgYGBcbiAqXG4gKiBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gXCIuL19vcy50c1wiO1xuaW1wb3J0ICogYXMgX3dpbmRvd3MgZnJvbSBcIi4vd2luZG93cy9tb2QudHNcIjtcbmltcG9ydCAqIGFzIF9wb3NpeCBmcm9tIFwiLi9wb3NpeC9tb2QudHNcIjtcblxuLyoqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgMS4wLjApIEltcG9ydCBmcm9tIHtAbGluayBodHRwczovL2Rlbm8ubGFuZC9zdGQvcGF0aC93aW5kb3dzL21vZC50c30gaW5zdGVhZC4gKi9cbmV4cG9ydCBjb25zdCB3aW4zMiA9IF93aW5kb3dzO1xuXG4vKiogQGRlcHJlY2F0ZWQgKHdpbGwgYmUgcmVtb3ZlZCBhZnRlciAxLjAuMCkgSW1wb3J0IGZyb20ge0BsaW5rIGh0dHBzOi8vZGVuby5sYW5kL3N0ZC9wb3NpeC9tb2QudHN9IGluc3RlYWQuICovXG5leHBvcnQgY29uc3QgcG9zaXggPSBfcG9zaXg7XG5cbmV4cG9ydCBjb25zdCBzZXAgPSBpc1dpbmRvd3MgPyBfd2luZG93cy5zZXAgOiBfcG9zaXguc2VwO1xuZXhwb3J0IGNvbnN0IGRlbGltaXRlciA9IGlzV2luZG93cyA/IF93aW5kb3dzLmRlbGltaXRlciA6IF9wb3NpeC5kZWxpbWl0ZXI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2VuYW1lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kaXJuYW1lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9leHRuYW1lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Zyb21fZmlsZV91cmwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2lzX2Fic29sdXRlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9qb2luLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ub3JtYWxpemUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9yZWxhdGl2ZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVzb2x2ZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdG9fZmlsZV91cmwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RvX25hbWVzcGFjZWRfcGF0aC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY29tbW9uLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zZXBhcmF0b3IudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL19pbnRlcmZhY2UudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2dsb2JfdG9fcmVnZXhwLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9pc19nbG9iLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9qb2luX2dsb2JzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ub3JtYWxpemVfZ2xvYi50c1wiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxpREFBaUQ7QUFDakQsb0VBQW9FO0FBQ3BFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E2QkMsR0FFRCxTQUFTLFNBQVMsUUFBUSxXQUFXO0FBQ3JDLFlBQVksY0FBYyxtQkFBbUI7QUFDN0MsWUFBWSxZQUFZLGlCQUFpQjtBQUV6QyxxSEFBcUgsR0FDckgsT0FBTyxNQUFNLFFBQVEsU0FBUztBQUU5Qiw4R0FBOEcsR0FDOUcsT0FBTyxNQUFNLFFBQVEsT0FBTztBQUU1QixPQUFPLE1BQU0sTUFBTSxZQUFZLFNBQVMsR0FBRyxHQUFHLE9BQU8sR0FBRyxDQUFDO0FBQ3pELE9BQU8sTUFBTSxZQUFZLFlBQVksU0FBUyxTQUFTLEdBQUcsT0FBTyxTQUFTLENBQUM7QUFFM0UsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxlQUFlO0FBQzdCLGNBQWMsZUFBZTtBQUM3QixjQUFjLGNBQWM7QUFDNUIsY0FBYyxxQkFBcUI7QUFDbkMsY0FBYyxtQkFBbUI7QUFDakMsY0FBYyxZQUFZO0FBQzFCLGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsYUFBYTtBQUMzQixjQUFjLGdCQUFnQjtBQUM5QixjQUFjLGVBQWU7QUFDN0IsY0FBYyxtQkFBbUI7QUFDakMsY0FBYywwQkFBMEI7QUFDeEMsY0FBYyxjQUFjO0FBQzVCLGNBQWMsaUJBQWlCO0FBQy9CLGNBQWMsa0JBQWtCO0FBQ2hDLGNBQWMsc0JBQXNCO0FBQ3BDLGNBQWMsZUFBZTtBQUM3QixjQUFjLGtCQUFrQjtBQUNoQyxjQUFjLHNCQUFzQiJ9
// denoCacheMetadata=17435384242847697746,10505455446675254422
