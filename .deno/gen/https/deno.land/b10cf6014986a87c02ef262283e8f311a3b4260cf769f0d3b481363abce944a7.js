// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/** Options for {@linkcode exists} and {@linkcode existsSync.} */
/**
 * Test whether or not the given path exists by checking with the file system. Please consider to check if the path is readable and either a file or a directory by providing additional `options`:
 *
 * ```ts
 * import { exists } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 * const isReadableDir = await exists("./foo", {
 *   isReadable: true,
 *   isDirectory: true
 * });
 * const isReadableFile = await exists("./bar", {
 *   isReadable: true,
 *   isFile: true
 * });
 * ```
 *
 * Note: Do not use this function if performing a check before another operation on that file. Doing so creates a race condition. Instead, perform the actual file operation directly.
 *
 * Bad:
 * ```ts
 * import { exists } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * if (await exists("./foo")) {
 *   await Deno.remove("./foo");
 * }
 * ```
 *
 * Good:
 * ```ts
 * // Notice no use of exists
 * try {
 *   await Deno.remove("./foo", { recursive: true });
 * } catch (error) {
 *   if (!(error instanceof Deno.errors.NotFound)) {
 *     throw error;
 *   }
 *   // Do nothing...
 * }
 * ```
 * @see https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
 */ export async function exists(path, options) {
  try {
    const stat = await Deno.stat(path);
    if (
      options && (options.isReadable || options.isDirectory || options.isFile)
    ) {
      if (options.isDirectory && options.isFile) {
        throw new TypeError(
          "ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.",
        );
      }
      if (
        options.isDirectory && !stat.isDirectory ||
        options.isFile && !stat.isFile
      ) {
        return false;
      }
      if (options.isReadable) {
        if (stat.mode === null) {
          return true; // Exclusive on Non-POSIX systems
        }
        if (Deno.uid() === stat.uid) {
          return (stat.mode & 0o400) === 0o400; // User is owner and can read?
        } else if (Deno.gid() === stat.gid) {
          return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
        }
        return (stat.mode & 0o004) === 0o004; // Others can read?
      }
    }
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      if (
        (await Deno.permissions.query({
          name: "read",
          path,
        })).state === "granted"
      ) {
        // --allow-read not missing
        return !options?.isReadable; // PermissionDenied was raised by file system, so the item exists, but can't be read
      }
    }
    throw error;
  }
}
/**
 * Test whether or not the given path exists by checking with the file system. Please consider to check if the path is readable and either a file or a directory by providing additional `options`:
 *
 * ```ts
 * import { existsSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 * const isReadableDir = existsSync("./foo", {
 *   isReadable: true,
 *   isDirectory: true
 * });
 * const isReadableFile = existsSync("./bar", {
 *   isReadable: true,
 *   isFile: true
 * });
 * ```
 *
 * Note: do not use this function if performing a check before another operation on that file. Doing so creates a race condition. Instead, perform the actual file operation directly.
 *
 * Bad:
 * ```ts
 * import { existsSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * if (existsSync("./foo")) {
 *   Deno.removeSync("./foo");
 * }
 * ```
 *
 * Good:
 * ```ts
 * // Notice no use of existsSync
 * try {
 *   Deno.removeSync("./foo", { recursive: true });
 * } catch (error) {
 *   if (!(error instanceof Deno.errors.NotFound)) {
 *     throw error;
 *   }
 *   // Do nothing...
 * }
 * ```
 * @see https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use
 */ export function existsSync(path, options) {
  try {
    const stat = Deno.statSync(path);
    if (
      options && (options.isReadable || options.isDirectory || options.isFile)
    ) {
      if (options.isDirectory && options.isFile) {
        throw new TypeError(
          "ExistsOptions.options.isDirectory and ExistsOptions.options.isFile must not be true together.",
        );
      }
      if (
        options.isDirectory && !stat.isDirectory ||
        options.isFile && !stat.isFile
      ) {
        return false;
      }
      if (options.isReadable) {
        if (stat.mode === null) {
          return true; // Exclusive on Non-POSIX systems
        }
        if (Deno.uid() === stat.uid) {
          return (stat.mode & 0o400) === 0o400; // User is owner and can read?
        } else if (Deno.gid() === stat.gid) {
          return (stat.mode & 0o040) === 0o040; // User group is owner and can read?
        }
        return (stat.mode & 0o004) === 0o004; // Others can read?
      }
    }
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      if (
        Deno.permissions.querySync({
          name: "read",
          path,
        }).state === "granted"
      ) {
        // --allow-read not missing
        return !options?.isReadable; // PermissionDenied was raised by file system, so the item exists, but can't be read
      }
    }
    throw error;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL2V4aXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG4vKiogT3B0aW9ucyBmb3Ige0BsaW5rY29kZSBleGlzdHN9IGFuZCB7QGxpbmtjb2RlIGV4aXN0c1N5bmMufSAqL1xuZXhwb3J0IGludGVyZmFjZSBFeGlzdHNPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZW4gYHRydWVgLCB3aWxsIGNoZWNrIGlmIHRoZSBwYXRoIGlzIHJlYWRhYmxlIGJ5IHRoZSB1c2VyIGFzIHdlbGwuXG4gICAqIEBkZWZhdWx0IHtmYWxzZX1cbiAgICovXG4gIGlzUmVhZGFibGU/OiBib29sZWFuO1xuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHdpbGwgY2hlY2sgaWYgdGhlIHBhdGggaXMgYSBkaXJlY3RvcnkgYXMgd2VsbC5cbiAgICogRGlyZWN0b3J5IHN5bWxpbmtzIGFyZSBpbmNsdWRlZC5cbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgaXNEaXJlY3Rvcnk/OiBib29sZWFuO1xuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHdpbGwgY2hlY2sgaWYgdGhlIHBhdGggaXMgYSBmaWxlIGFzIHdlbGwuXG4gICAqIEZpbGUgc3ltbGlua3MgYXJlIGluY2x1ZGVkLlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBpc0ZpbGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHBhdGggZXhpc3RzIGJ5IGNoZWNraW5nIHdpdGggdGhlIGZpbGUgc3lzdGVtLiBQbGVhc2UgY29uc2lkZXIgdG8gY2hlY2sgaWYgdGhlIHBhdGggaXMgcmVhZGFibGUgYW5kIGVpdGhlciBhIGZpbGUgb3IgYSBkaXJlY3RvcnkgYnkgcHJvdmlkaW5nIGFkZGl0aW9uYWwgYG9wdGlvbnNgOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9mcy9tb2QudHNcIjtcbiAqIGNvbnN0IGlzUmVhZGFibGVEaXIgPSBhd2FpdCBleGlzdHMoXCIuL2Zvb1wiLCB7XG4gKiAgIGlzUmVhZGFibGU6IHRydWUsXG4gKiAgIGlzRGlyZWN0b3J5OiB0cnVlXG4gKiB9KTtcbiAqIGNvbnN0IGlzUmVhZGFibGVGaWxlID0gYXdhaXQgZXhpc3RzKFwiLi9iYXJcIiwge1xuICogICBpc1JlYWRhYmxlOiB0cnVlLFxuICogICBpc0ZpbGU6IHRydWVcbiAqIH0pO1xuICogYGBgXG4gKlxuICogTm90ZTogRG8gbm90IHVzZSB0aGlzIGZ1bmN0aW9uIGlmIHBlcmZvcm1pbmcgYSBjaGVjayBiZWZvcmUgYW5vdGhlciBvcGVyYXRpb24gb24gdGhhdCBmaWxlLiBEb2luZyBzbyBjcmVhdGVzIGEgcmFjZSBjb25kaXRpb24uIEluc3RlYWQsIHBlcmZvcm0gdGhlIGFjdHVhbCBmaWxlIG9wZXJhdGlvbiBkaXJlY3RseS5cbiAqXG4gKiBCYWQ6XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXhpc3RzIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKlxuICogaWYgKGF3YWl0IGV4aXN0cyhcIi4vZm9vXCIpKSB7XG4gKiAgIGF3YWl0IERlbm8ucmVtb3ZlKFwiLi9mb29cIik7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBHb29kOlxuICogYGBgdHNcbiAqIC8vIE5vdGljZSBubyB1c2Ugb2YgZXhpc3RzXG4gKiB0cnkge1xuICogICBhd2FpdCBEZW5vLnJlbW92ZShcIi4vZm9vXCIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICogfSBjYXRjaCAoZXJyb3IpIHtcbiAqICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAqICAgICB0aHJvdyBlcnJvcjtcbiAqICAgfVxuICogICAvLyBEbyBub3RoaW5nLi4uXG4gKiB9XG4gKiBgYGBcbiAqIEBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVGltZS1vZi1jaGVja190b190aW1lLW9mLXVzZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhpc3RzKFxuICBwYXRoOiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM/OiBFeGlzdHNPcHRpb25zLFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdCA9IGF3YWl0IERlbm8uc3RhdChwYXRoKTtcbiAgICBpZiAoXG4gICAgICBvcHRpb25zICYmXG4gICAgICAob3B0aW9ucy5pc1JlYWRhYmxlIHx8IG9wdGlvbnMuaXNEaXJlY3RvcnkgfHwgb3B0aW9ucy5pc0ZpbGUpXG4gICAgKSB7XG4gICAgICBpZiAob3B0aW9ucy5pc0RpcmVjdG9yeSAmJiBvcHRpb25zLmlzRmlsZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiRXhpc3RzT3B0aW9ucy5vcHRpb25zLmlzRGlyZWN0b3J5IGFuZCBFeGlzdHNPcHRpb25zLm9wdGlvbnMuaXNGaWxlIG11c3Qgbm90IGJlIHRydWUgdG9nZXRoZXIuXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIChvcHRpb25zLmlzRGlyZWN0b3J5ICYmICFzdGF0LmlzRGlyZWN0b3J5KSB8fFxuICAgICAgICAob3B0aW9ucy5pc0ZpbGUgJiYgIXN0YXQuaXNGaWxlKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLmlzUmVhZGFibGUpIHtcbiAgICAgICAgaWYgKHN0YXQubW9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBFeGNsdXNpdmUgb24gTm9uLVBPU0lYIHN5c3RlbXNcbiAgICAgICAgfVxuICAgICAgICBpZiAoRGVuby51aWQoKSA9PT0gc3RhdC51aWQpIHtcbiAgICAgICAgICByZXR1cm4gKHN0YXQubW9kZSAmIDBvNDAwKSA9PT0gMG80MDA7IC8vIFVzZXIgaXMgb3duZXIgYW5kIGNhbiByZWFkP1xuICAgICAgICB9IGVsc2UgaWYgKERlbm8uZ2lkKCkgPT09IHN0YXQuZ2lkKSB7XG4gICAgICAgICAgcmV0dXJuIChzdGF0Lm1vZGUgJiAwbzA0MCkgPT09IDBvMDQwOyAvLyBVc2VyIGdyb3VwIGlzIG93bmVyIGFuZCBjYW4gcmVhZD9cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHN0YXQubW9kZSAmIDBvMDA0KSA9PT0gMG8wMDQ7IC8vIE90aGVycyBjYW4gcmVhZD9cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuUGVybWlzc2lvbkRlbmllZCkge1xuICAgICAgaWYgKFxuICAgICAgICAoYXdhaXQgRGVuby5wZXJtaXNzaW9ucy5xdWVyeSh7IG5hbWU6IFwicmVhZFwiLCBwYXRoIH0pKS5zdGF0ZSA9PT1cbiAgICAgICAgICBcImdyYW50ZWRcIlxuICAgICAgKSB7XG4gICAgICAgIC8vIC0tYWxsb3ctcmVhZCBub3QgbWlzc2luZ1xuICAgICAgICByZXR1cm4gIW9wdGlvbnM/LmlzUmVhZGFibGU7IC8vIFBlcm1pc3Npb25EZW5pZWQgd2FzIHJhaXNlZCBieSBmaWxlIHN5c3RlbSwgc28gdGhlIGl0ZW0gZXhpc3RzLCBidXQgY2FuJ3QgYmUgcmVhZFxuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHBhdGggZXhpc3RzIGJ5IGNoZWNraW5nIHdpdGggdGhlIGZpbGUgc3lzdGVtLiBQbGVhc2UgY29uc2lkZXIgdG8gY2hlY2sgaWYgdGhlIHBhdGggaXMgcmVhZGFibGUgYW5kIGVpdGhlciBhIGZpbGUgb3IgYSBkaXJlY3RvcnkgYnkgcHJvdmlkaW5nIGFkZGl0aW9uYWwgYG9wdGlvbnNgOlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKiBjb25zdCBpc1JlYWRhYmxlRGlyID0gZXhpc3RzU3luYyhcIi4vZm9vXCIsIHtcbiAqICAgaXNSZWFkYWJsZTogdHJ1ZSxcbiAqICAgaXNEaXJlY3Rvcnk6IHRydWVcbiAqIH0pO1xuICogY29uc3QgaXNSZWFkYWJsZUZpbGUgPSBleGlzdHNTeW5jKFwiLi9iYXJcIiwge1xuICogICBpc1JlYWRhYmxlOiB0cnVlLFxuICogICBpc0ZpbGU6IHRydWVcbiAqIH0pO1xuICogYGBgXG4gKlxuICogTm90ZTogZG8gbm90IHVzZSB0aGlzIGZ1bmN0aW9uIGlmIHBlcmZvcm1pbmcgYSBjaGVjayBiZWZvcmUgYW5vdGhlciBvcGVyYXRpb24gb24gdGhhdCBmaWxlLiBEb2luZyBzbyBjcmVhdGVzIGEgcmFjZSBjb25kaXRpb24uIEluc3RlYWQsIHBlcmZvcm0gdGhlIGFjdHVhbCBmaWxlIG9wZXJhdGlvbiBkaXJlY3RseS5cbiAqXG4gKiBCYWQ6XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL21vZC50c1wiO1xuICpcbiAqIGlmIChleGlzdHNTeW5jKFwiLi9mb29cIikpIHtcbiAqICAgRGVuby5yZW1vdmVTeW5jKFwiLi9mb29cIik7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBHb29kOlxuICogYGBgdHNcbiAqIC8vIE5vdGljZSBubyB1c2Ugb2YgZXhpc3RzU3luY1xuICogdHJ5IHtcbiAqICAgRGVuby5yZW1vdmVTeW5jKFwiLi9mb29cIiwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gKiB9IGNhdGNoIChlcnJvcikge1xuICogICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICogICAgIHRocm93IGVycm9yO1xuICogICB9XG4gKiAgIC8vIERvIG5vdGhpbmcuLi5cbiAqIH1cbiAqIGBgYFxuICogQHNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9UaW1lLW9mLWNoZWNrX3RvX3RpbWUtb2YtdXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGlzdHNTeW5jKFxuICBwYXRoOiBzdHJpbmcgfCBVUkwsXG4gIG9wdGlvbnM/OiBFeGlzdHNPcHRpb25zLFxuKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdCA9IERlbm8uc3RhdFN5bmMocGF0aCk7XG4gICAgaWYgKFxuICAgICAgb3B0aW9ucyAmJlxuICAgICAgKG9wdGlvbnMuaXNSZWFkYWJsZSB8fCBvcHRpb25zLmlzRGlyZWN0b3J5IHx8IG9wdGlvbnMuaXNGaWxlKVxuICAgICkge1xuICAgICAgaWYgKG9wdGlvbnMuaXNEaXJlY3RvcnkgJiYgb3B0aW9ucy5pc0ZpbGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIkV4aXN0c09wdGlvbnMub3B0aW9ucy5pc0RpcmVjdG9yeSBhbmQgRXhpc3RzT3B0aW9ucy5vcHRpb25zLmlzRmlsZSBtdXN0IG5vdCBiZSB0cnVlIHRvZ2V0aGVyLlwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICAob3B0aW9ucy5pc0RpcmVjdG9yeSAmJiAhc3RhdC5pc0RpcmVjdG9yeSkgfHxcbiAgICAgICAgKG9wdGlvbnMuaXNGaWxlICYmICFzdGF0LmlzRmlsZSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5pc1JlYWRhYmxlKSB7XG4gICAgICAgIGlmIChzdGF0Lm1vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gRXhjbHVzaXZlIG9uIE5vbi1QT1NJWCBzeXN0ZW1zXG4gICAgICAgIH1cbiAgICAgICAgaWYgKERlbm8udWlkKCkgPT09IHN0YXQudWlkKSB7XG4gICAgICAgICAgcmV0dXJuIChzdGF0Lm1vZGUgJiAwbzQwMCkgPT09IDBvNDAwOyAvLyBVc2VyIGlzIG93bmVyIGFuZCBjYW4gcmVhZD9cbiAgICAgICAgfSBlbHNlIGlmIChEZW5vLmdpZCgpID09PSBzdGF0LmdpZCkge1xuICAgICAgICAgIHJldHVybiAoc3RhdC5tb2RlICYgMG8wNDApID09PSAwbzA0MDsgLy8gVXNlciBncm91cCBpcyBvd25lciBhbmQgY2FuIHJlYWQ/XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChzdGF0Lm1vZGUgJiAwbzAwNCkgPT09IDBvMDA0OyAvLyBPdGhlcnMgY2FuIHJlYWQ/XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLlBlcm1pc3Npb25EZW5pZWQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgRGVuby5wZXJtaXNzaW9ucy5xdWVyeVN5bmMoeyBuYW1lOiBcInJlYWRcIiwgcGF0aCB9KS5zdGF0ZSA9PT0gXCJncmFudGVkXCJcbiAgICAgICkge1xuICAgICAgICAvLyAtLWFsbG93LXJlYWQgbm90IG1pc3NpbmdcbiAgICAgICAgcmV0dXJuICFvcHRpb25zPy5pc1JlYWRhYmxlOyAvLyBQZXJtaXNzaW9uRGVuaWVkIHdhcyByYWlzZWQgYnkgZmlsZSBzeXN0ZW0sIHNvIHRoZSBpdGVtIGV4aXN0cywgYnV0IGNhbid0IGJlIHJlYWRcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFFMUUsK0RBQStELEdBcUIvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUNDLEdBQ0QsT0FBTyxlQUFlLE9BQ3BCLElBQWtCLEVBQ2xCLE9BQXVCO0VBRXZCLElBQUk7SUFDRixNQUFNLE9BQU8sTUFBTSxLQUFLLElBQUksQ0FBQztJQUM3QixJQUNFLFdBQ0EsQ0FBQyxRQUFRLFVBQVUsSUFBSSxRQUFRLFdBQVcsSUFBSSxRQUFRLE1BQU0sR0FDNUQ7TUFDQSxJQUFJLFFBQVEsV0FBVyxJQUFJLFFBQVEsTUFBTSxFQUFFO1FBQ3pDLE1BQU0sSUFBSSxVQUNSO01BRUo7TUFDQSxJQUNFLEFBQUMsUUFBUSxXQUFXLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFDeEMsUUFBUSxNQUFNLElBQUksQ0FBQyxLQUFLLE1BQU0sRUFDL0I7UUFDQSxPQUFPO01BQ1Q7TUFDQSxJQUFJLFFBQVEsVUFBVSxFQUFFO1FBQ3RCLElBQUksS0FBSyxJQUFJLEtBQUssTUFBTTtVQUN0QixPQUFPLE1BQU0saUNBQWlDO1FBQ2hEO1FBQ0EsSUFBSSxLQUFLLEdBQUcsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUMzQixPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLE9BQU8sOEJBQThCO1FBQ3RFLE9BQU8sSUFBSSxLQUFLLEdBQUcsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUNsQyxPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsS0FBSyxNQUFNLE9BQU8sb0NBQW9DO1FBQzVFO1FBQ0EsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxPQUFPLG1CQUFtQjtNQUMzRDtJQUNGO0lBQ0EsT0FBTztFQUNULEVBQUUsT0FBTyxPQUFPO0lBQ2QsSUFBSSxpQkFBaUIsS0FBSyxNQUFNLENBQUMsUUFBUSxFQUFFO01BQ3pDLE9BQU87SUFDVDtJQUNBLElBQUksaUJBQWlCLEtBQUssTUFBTSxDQUFDLGdCQUFnQixFQUFFO01BQ2pELElBQ0UsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLEtBQUssQ0FBQztRQUFFLE1BQU07UUFBUTtNQUFLLEVBQUUsRUFBRSxLQUFLLEtBQzFELFdBQ0Y7UUFDQSwyQkFBMkI7UUFDM0IsT0FBTyxDQUFDLFNBQVMsWUFBWSxvRkFBb0Y7TUFDbkg7SUFDRjtJQUNBLE1BQU07RUFDUjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXVDQyxHQUNELE9BQU8sU0FBUyxXQUNkLElBQWtCLEVBQ2xCLE9BQXVCO0VBRXZCLElBQUk7SUFDRixNQUFNLE9BQU8sS0FBSyxRQUFRLENBQUM7SUFDM0IsSUFDRSxXQUNBLENBQUMsUUFBUSxVQUFVLElBQUksUUFBUSxXQUFXLElBQUksUUFBUSxNQUFNLEdBQzVEO01BQ0EsSUFBSSxRQUFRLFdBQVcsSUFBSSxRQUFRLE1BQU0sRUFBRTtRQUN6QyxNQUFNLElBQUksVUFDUjtNQUVKO01BQ0EsSUFDRSxBQUFDLFFBQVEsV0FBVyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQ3hDLFFBQVEsTUFBTSxJQUFJLENBQUMsS0FBSyxNQUFNLEVBQy9CO1FBQ0EsT0FBTztNQUNUO01BQ0EsSUFBSSxRQUFRLFVBQVUsRUFBRTtRQUN0QixJQUFJLEtBQUssSUFBSSxLQUFLLE1BQU07VUFDdEIsT0FBTyxNQUFNLGlDQUFpQztRQUNoRDtRQUNBLElBQUksS0FBSyxHQUFHLE9BQU8sS0FBSyxHQUFHLEVBQUU7VUFDM0IsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxPQUFPLDhCQUE4QjtRQUN0RSxPQUFPLElBQUksS0FBSyxHQUFHLE9BQU8sS0FBSyxHQUFHLEVBQUU7VUFDbEMsT0FBTyxDQUFDLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxPQUFPLG9DQUFvQztRQUM1RTtRQUNBLE9BQU8sQ0FBQyxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sT0FBTyxtQkFBbUI7TUFDM0Q7SUFDRjtJQUNBLE9BQU87RUFDVCxFQUFFLE9BQU8sT0FBTztJQUNkLElBQUksaUJBQWlCLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtNQUN6QyxPQUFPO0lBQ1Q7SUFDQSxJQUFJLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtNQUNqRCxJQUNFLEtBQUssV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUFFLE1BQU07UUFBUTtNQUFLLEdBQUcsS0FBSyxLQUFLLFdBQzdEO1FBQ0EsMkJBQTJCO1FBQzNCLE9BQU8sQ0FBQyxTQUFTLFlBQVksb0ZBQW9GO01BQ25IO0lBQ0Y7SUFDQSxNQUFNO0VBQ1I7QUFDRiJ9
// denoCacheMetadata=8859029075931650292,13533009982652138029
