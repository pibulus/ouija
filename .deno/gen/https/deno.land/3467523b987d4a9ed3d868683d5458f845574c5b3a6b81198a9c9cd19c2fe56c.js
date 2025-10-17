// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/
// This module is browser compatible.
/**
 * Utilities for working with OS-specific file paths.
 *
 * Codes in the examples uses POSIX path but it automatically use Windows path
 * on Windows. Use methods under `posix` or `win32` object instead to handle non
 * platform specific path like:
 * ```ts
 * import { posix, win32 } from "https://deno.land/std@$STD_VERSION/path/mod.ts";
 * const p1 = posix.fromFileUrl("file:///home/foo");
 * const p2 = win32.fromFileUrl("file:///home/foo");
 * console.log(p1); // "/home/foo"
 * console.log(p2); // "\\home\\foo"
 * ```
 *
 * This module is browser compatible.
 *
 * @module
 */ export const sep = "\\";
export const delimiter = ";";
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
export * from "../_interface.ts";
export * from "./glob_to_regexp.ts";
export * from "./is_glob.ts";
export * from "./join_globs.ts";
export * from "./normalize_glob.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwOC4wL3BhdGgvd2luZG93cy9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCB0aGUgQnJvd3NlcmlmeSBhdXRob3JzLiBNSVQgTGljZW5zZS5cbi8vIFBvcnRlZCBtb3N0bHkgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYnJvd3NlcmlmeS9wYXRoLWJyb3dzZXJpZnkvXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogVXRpbGl0aWVzIGZvciB3b3JraW5nIHdpdGggT1Mtc3BlY2lmaWMgZmlsZSBwYXRocy5cbiAqXG4gKiBDb2RlcyBpbiB0aGUgZXhhbXBsZXMgdXNlcyBQT1NJWCBwYXRoIGJ1dCBpdCBhdXRvbWF0aWNhbGx5IHVzZSBXaW5kb3dzIHBhdGhcbiAqIG9uIFdpbmRvd3MuIFVzZSBtZXRob2RzIHVuZGVyIGBwb3NpeGAgb3IgYHdpbjMyYCBvYmplY3QgaW5zdGVhZCB0byBoYW5kbGUgbm9uXG4gKiBwbGF0Zm9ybSBzcGVjaWZpYyBwYXRoIGxpa2U6XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcG9zaXgsIHdpbjMyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vcGF0aC9tb2QudHNcIjtcbiAqIGNvbnN0IHAxID0gcG9zaXguZnJvbUZpbGVVcmwoXCJmaWxlOi8vL2hvbWUvZm9vXCIpO1xuICogY29uc3QgcDIgPSB3aW4zMi5mcm9tRmlsZVVybChcImZpbGU6Ly8vaG9tZS9mb29cIik7XG4gKiBjb25zb2xlLmxvZyhwMSk7IC8vIFwiL2hvbWUvZm9vXCJcbiAqIGNvbnNvbGUubG9nKHAyKTsgLy8gXCJcXFxcaG9tZVxcXFxmb29cIlxuICogYGBgXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQgY29uc3Qgc2VwID0gXCJcXFxcXCI7XG5leHBvcnQgY29uc3QgZGVsaW1pdGVyID0gXCI7XCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2VuYW1lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kaXJuYW1lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9leHRuYW1lLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9mb3JtYXQudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Zyb21fZmlsZV91cmwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2lzX2Fic29sdXRlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9qb2luLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ub3JtYWxpemUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9yZWxhdGl2ZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vcmVzb2x2ZS50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdG9fZmlsZV91cmwudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3RvX25hbWVzcGFjZWRfcGF0aC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vY29tbW9uLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zZXBhcmF0b3IudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuLi9faW50ZXJmYWNlLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9nbG9iX3RvX3JlZ2V4cC50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaXNfZ2xvYi50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vam9pbl9nbG9icy50c1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbm9ybWFsaXplX2dsb2IudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsaURBQWlEO0FBQ2pELG9FQUFvRTtBQUNwRSxxQ0FBcUM7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBaUJDLEdBRUQsT0FBTyxNQUFNLE1BQU0sS0FBSztBQUN4QixPQUFPLE1BQU0sWUFBWSxJQUFJO0FBRTdCLGNBQWMsZ0JBQWdCO0FBQzlCLGNBQWMsZUFBZTtBQUM3QixjQUFjLGVBQWU7QUFDN0IsY0FBYyxjQUFjO0FBQzVCLGNBQWMscUJBQXFCO0FBQ25DLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsWUFBWTtBQUMxQixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLGFBQWE7QUFDM0IsY0FBYyxnQkFBZ0I7QUFDOUIsY0FBYyxlQUFlO0FBQzdCLGNBQWMsbUJBQW1CO0FBQ2pDLGNBQWMsMEJBQTBCO0FBQ3hDLGNBQWMsY0FBYztBQUM1QixjQUFjLGlCQUFpQjtBQUMvQixjQUFjLG1CQUFtQjtBQUNqQyxjQUFjLHNCQUFzQjtBQUNwQyxjQUFjLGVBQWU7QUFDN0IsY0FBYyxrQkFBa0I7QUFDaEMsY0FBYyxzQkFBc0IifQ==
// denoCacheMetadata=16926465920292636286,7428549380167616456
