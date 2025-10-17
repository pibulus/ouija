// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { getFileInfoType } from "./_util.ts";
/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { ensureDir } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * ensureDir("./bar"); // returns a promise
 * ```
 */ export async function ensureDir(dir) {
  try {
    await Deno.mkdir(dir, {
      recursive: true,
    });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      throw err;
    }
    const fileInfo = await Deno.lstat(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(
        `Ensure path exists, expected 'dir', got '${
          getFileInfoType(fileInfo)
        }'`,
      );
    }
  }
}
/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { ensureDirSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * ensureDirSync("./ensureDirSync"); // void
 * ```
 */ export function ensureDirSync(dir) {
  try {
    Deno.mkdirSync(dir, {
      recursive: true,
    });
  } catch (err) {
    if (!(err instanceof Deno.errors.AlreadyExists)) {
      throw err;
    }
    const fileInfo = Deno.lstatSync(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(
        `Ensure path exists, expected 'dir', got '${
          getFileInfoType(fileInfo)
        }'`,
      );
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwOC4wL2ZzL2Vuc3VyZV9kaXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IGdldEZpbGVJbmZvVHlwZSB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBkaXJlY3RvcnkgZXhpc3RzLlxuICogSWYgdGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuIExpa2UgbWtkaXIgLXAuXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgYW5kIGAtLWFsbG93LXdyaXRlYCBmbGFnLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW5zdXJlRGlyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKlxuICogZW5zdXJlRGlyKFwiLi9iYXJcIik7IC8vIHJldHVybnMgYSBwcm9taXNlXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZURpcihkaXI6IHN0cmluZyB8IFVSTCkge1xuICB0cnkge1xuICAgIGF3YWl0IERlbm8ubWtkaXIoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuQWxyZWFkeUV4aXN0cykpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlSW5mbyA9IGF3YWl0IERlbm8ubHN0YXQoZGlyKTtcbiAgICBpZiAoIWZpbGVJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBFbnN1cmUgcGF0aCBleGlzdHMsIGV4cGVjdGVkICdkaXInLCBnb3QgJyR7XG4gICAgICAgICAgZ2V0RmlsZUluZm9UeXBlKGZpbGVJbmZvKVxuICAgICAgICB9J2AsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCB0aGUgZGlyZWN0b3J5IGV4aXN0cy5cbiAqIElmIHRoZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLiBMaWtlIG1rZGlyIC1wLlxuICogUmVxdWlyZXMgdGhlIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy13cml0ZWAgZmxhZy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVuc3VyZURpclN5bmMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9mcy9tb2QudHNcIjtcbiAqXG4gKiBlbnN1cmVEaXJTeW5jKFwiLi9lbnN1cmVEaXJTeW5jXCIpOyAvLyB2b2lkXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZURpclN5bmMoZGlyOiBzdHJpbmcgfCBVUkwpIHtcbiAgdHJ5IHtcbiAgICBEZW5vLm1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5BbHJlYWR5RXhpc3RzKSkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVJbmZvID0gRGVuby5sc3RhdFN5bmMoZGlyKTtcbiAgICBpZiAoIWZpbGVJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBFbnN1cmUgcGF0aCBleGlzdHMsIGV4cGVjdGVkICdkaXInLCBnb3QgJyR7XG4gICAgICAgICAgZ2V0RmlsZUluZm9UeXBlKGZpbGVJbmZvKVxuICAgICAgICB9J2AsXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLGVBQWUsUUFBUSxhQUFhO0FBRTdDOzs7Ozs7Ozs7OztDQVdDLEdBQ0QsT0FBTyxlQUFlLFVBQVUsR0FBaUI7RUFDL0MsSUFBSTtJQUNGLE1BQU0sS0FBSyxLQUFLLENBQUMsS0FBSztNQUFFLFdBQVc7SUFBSztFQUMxQyxFQUFFLE9BQU8sS0FBSztJQUNaLElBQUksQ0FBQyxDQUFDLGVBQWUsS0FBSyxNQUFNLENBQUMsYUFBYSxHQUFHO01BQy9DLE1BQU07SUFDUjtJQUVBLE1BQU0sV0FBVyxNQUFNLEtBQUssS0FBSyxDQUFDO0lBQ2xDLElBQUksQ0FBQyxTQUFTLFdBQVcsRUFBRTtNQUN6QixNQUFNLElBQUksTUFDUixDQUFDLHlDQUF5QyxFQUN4QyxnQkFBZ0IsVUFDakIsQ0FBQyxDQUFDO0lBRVA7RUFDRjtBQUNGO0FBRUE7Ozs7Ozs7Ozs7O0NBV0MsR0FDRCxPQUFPLFNBQVMsY0FBYyxHQUFpQjtFQUM3QyxJQUFJO0lBQ0YsS0FBSyxTQUFTLENBQUMsS0FBSztNQUFFLFdBQVc7SUFBSztFQUN4QyxFQUFFLE9BQU8sS0FBSztJQUNaLElBQUksQ0FBQyxDQUFDLGVBQWUsS0FBSyxNQUFNLENBQUMsYUFBYSxHQUFHO01BQy9DLE1BQU07SUFDUjtJQUVBLE1BQU0sV0FBVyxLQUFLLFNBQVMsQ0FBQztJQUNoQyxJQUFJLENBQUMsU0FBUyxXQUFXLEVBQUU7TUFDekIsTUFBTSxJQUFJLE1BQ1IsQ0FBQyx5Q0FBeUMsRUFDeEMsZ0JBQWdCLFVBQ2pCLENBQUMsQ0FBQztJQUVQO0VBQ0Y7QUFDRiJ9
// denoCacheMetadata=3244822424191193621,7389666439193413646
