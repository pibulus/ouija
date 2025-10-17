// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { join } from "../path/join.ts";
import { toPathString } from "./_to_path_string.ts";
/**
 * Ensures that a directory is empty.
 * Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created.
 * The directory itself is not deleted.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { emptyDir } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * emptyDir("./foo"); // returns a promise
 * ```
 */ export async function emptyDir(dir) {
  try {
    const items = await Array.fromAsync(Deno.readDir(dir));
    await Promise.all(items.map((item) => {
      if (item && item.name) {
        const filepath = join(toPathString(dir), item.name);
        return Deno.remove(filepath, {
          recursive: true,
        });
      }
    }));
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    // if not exist. then create it
    await Deno.mkdir(dir, {
      recursive: true,
    });
  }
}
/**
 * Ensures that a directory is empty.
 * Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created.
 * The directory itself is not deleted.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { emptyDirSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * emptyDirSync("./foo"); // void
 * ```
 */ export function emptyDirSync(dir) {
  try {
    const items = [
      ...Deno.readDirSync(dir),
    ];
    // If the directory exists, remove all entries inside it.
    while (items.length) {
      const item = items.shift();
      if (item && item.name) {
        const filepath = join(toPathString(dir), item.name);
        Deno.removeSync(filepath, {
          recursive: true,
        });
      }
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    // if not exist. then create it
    Deno.mkdirSync(dir, {
      recursive: true,
    });
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL2VtcHR5X2Rpci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgam9pbiB9IGZyb20gXCIuLi9wYXRoL2pvaW4udHNcIjtcbmltcG9ydCB7IHRvUGF0aFN0cmluZyB9IGZyb20gXCIuL190b19wYXRoX3N0cmluZy50c1wiO1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCBhIGRpcmVjdG9yeSBpcyBlbXB0eS5cbiAqIERlbGV0ZXMgZGlyZWN0b3J5IGNvbnRlbnRzIGlmIHRoZSBkaXJlY3RvcnkgaXMgbm90IGVtcHR5LlxuICogSWYgdGhlIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdCwgaXQgaXMgY3JlYXRlZC5cbiAqIFRoZSBkaXJlY3RvcnkgaXRzZWxmIGlzIG5vdCBkZWxldGVkLlxuICogUmVxdWlyZXMgdGhlIGAtLWFsbG93LXJlYWRgIGFuZCBgLS1hbGxvdy13cml0ZWAgZmxhZy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVtcHR5RGlyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKlxuICogZW1wdHlEaXIoXCIuL2Zvb1wiKTsgLy8gcmV0dXJucyBhIHByb21pc2VcbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1wdHlEaXIoZGlyOiBzdHJpbmcgfCBVUkwpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBpdGVtcyA9IGF3YWl0IEFycmF5LmZyb21Bc3luYyhEZW5vLnJlYWREaXIoZGlyKSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtICYmIGl0ZW0ubmFtZSkge1xuICAgICAgICBjb25zdCBmaWxlcGF0aCA9IGpvaW4odG9QYXRoU3RyaW5nKGRpciksIGl0ZW0ubmFtZSk7XG4gICAgICAgIHJldHVybiBEZW5vLnJlbW92ZShmaWxlcGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG5cbiAgICAvLyBpZiBub3QgZXhpc3QuIHRoZW4gY3JlYXRlIGl0XG4gICAgYXdhaXQgRGVuby5ta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICB9XG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IGEgZGlyZWN0b3J5IGlzIGVtcHR5LlxuICogRGVsZXRlcyBkaXJlY3RvcnkgY29udGVudHMgaWYgdGhlIGRpcmVjdG9yeSBpcyBub3QgZW1wdHkuXG4gKiBJZiB0aGUgZGlyZWN0b3J5IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuICogVGhlIGRpcmVjdG9yeSBpdHNlbGYgaXMgbm90IGRlbGV0ZWQuXG4gKiBSZXF1aXJlcyB0aGUgYC0tYWxsb3ctcmVhZGAgYW5kIGAtLWFsbG93LXdyaXRlYCBmbGFnLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZW1wdHlEaXJTeW5jIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKlxuICogZW1wdHlEaXJTeW5jKFwiLi9mb29cIik7IC8vIHZvaWRcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW1wdHlEaXJTeW5jKGRpcjogc3RyaW5nIHwgVVJMKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgaXRlbXMgPSBbLi4uRGVuby5yZWFkRGlyU3luYyhkaXIpXTtcblxuICAgIC8vIElmIHRoZSBkaXJlY3RvcnkgZXhpc3RzLCByZW1vdmUgYWxsIGVudHJpZXMgaW5zaWRlIGl0LlxuICAgIHdoaWxlIChpdGVtcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtcy5zaGlmdCgpO1xuICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5uYW1lKSB7XG4gICAgICAgIGNvbnN0IGZpbGVwYXRoID0gam9pbih0b1BhdGhTdHJpbmcoZGlyKSwgaXRlbS5uYW1lKTtcbiAgICAgICAgRGVuby5yZW1vdmVTeW5jKGZpbGVwYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICghKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICAvLyBpZiBub3QgZXhpc3QuIHRoZW4gY3JlYXRlIGl0XG4gICAgRGVuby5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLElBQUksUUFBUSxrQkFBa0I7QUFDdkMsU0FBUyxZQUFZLFFBQVEsdUJBQXVCO0FBRXBEOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FDRCxPQUFPLGVBQWUsU0FBUyxHQUFpQjtFQUM5QyxJQUFJO0lBQ0YsTUFBTSxRQUFRLE1BQU0sTUFBTSxTQUFTLENBQUMsS0FBSyxPQUFPLENBQUM7SUFFakQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQzNCLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtRQUNyQixNQUFNLFdBQVcsS0FBSyxhQUFhLE1BQU0sS0FBSyxJQUFJO1FBQ2xELE9BQU8sS0FBSyxNQUFNLENBQUMsVUFBVTtVQUFFLFdBQVc7UUFBSztNQUNqRDtJQUNGO0VBQ0YsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztNQUMxQyxNQUFNO0lBQ1I7SUFFQSwrQkFBK0I7SUFDL0IsTUFBTSxLQUFLLEtBQUssQ0FBQyxLQUFLO01BQUUsV0FBVztJQUFLO0VBQzFDO0FBQ0Y7QUFFQTs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxTQUFTLGFBQWEsR0FBaUI7RUFDNUMsSUFBSTtJQUNGLE1BQU0sUUFBUTtTQUFJLEtBQUssV0FBVyxDQUFDO0tBQUs7SUFFeEMseURBQXlEO0lBQ3pELE1BQU8sTUFBTSxNQUFNLENBQUU7TUFDbkIsTUFBTSxPQUFPLE1BQU0sS0FBSztNQUN4QixJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7UUFDckIsTUFBTSxXQUFXLEtBQUssYUFBYSxNQUFNLEtBQUssSUFBSTtRQUNsRCxLQUFLLFVBQVUsQ0FBQyxVQUFVO1VBQUUsV0FBVztRQUFLO01BQzlDO0lBQ0Y7RUFDRixFQUFFLE9BQU8sS0FBSztJQUNaLElBQUksQ0FBQyxDQUFDLGVBQWUsS0FBSyxNQUFNLENBQUMsUUFBUSxHQUFHO01BQzFDLE1BQU07SUFDUjtJQUNBLCtCQUErQjtJQUMvQixLQUFLLFNBQVMsQ0FBQyxLQUFLO01BQUUsV0FBVztJQUFLO0VBQ3hDO0FBQ0YifQ==
// denoCacheMetadata=6943885892569832641,12050523895314875397
