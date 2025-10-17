// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { isSubdir } from "./_is_subdir.ts";
import { isSamePath } from "./_is_same_path.ts";
const EXISTS_ERROR = new Deno.errors.AlreadyExists("dest already exists.");
/**
 * Error thrown in {@linkcode move} or {@linkcode moveSync} when the
 * destination is a subdirectory of the source.
 */ export class SubdirectoryMoveError extends Error {
  /** Constructs a new instance. */ constructor(src, dest) {
    super(`Cannot move '${src}' to a subdirectory of itself, '${dest}'.`);
  }
}
/**
 * Moves a file or directory.
 *
 * @example
 * ```ts
 * import { move } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * move("./foo", "./bar"); // returns a promise
 * ```
 */ export async function move(src, dest, { overwrite = false } = {}) {
  const srcStat = await Deno.stat(src);
  if (srcStat.isDirectory && (isSubdir(src, dest) || isSamePath(src, dest))) {
    throw new SubdirectoryMoveError(src, dest);
  }
  if (overwrite) {
    if (isSamePath(src, dest)) return;
    try {
      await Deno.remove(dest, {
        recursive: true,
      });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    try {
      await Deno.lstat(dest);
      return Promise.reject(EXISTS_ERROR);
    } catch {
      // Do nothing...
    }
  }
  await Deno.rename(src, dest);
}
/**
 * Moves a file or directory synchronously.
 *
 * @example
 * ```ts
 * import { moveSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * moveSync("./foo", "./bar"); // void
 * ```
 */ export function moveSync(src, dest, { overwrite = false } = {}) {
  const srcStat = Deno.statSync(src);
  if (srcStat.isDirectory && (isSubdir(src, dest) || isSamePath(src, dest))) {
    throw new SubdirectoryMoveError(src, dest);
  }
  if (overwrite) {
    if (isSamePath(src, dest)) return;
    try {
      Deno.removeSync(dest, {
        recursive: true,
      });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    try {
      Deno.lstatSync(dest);
      throw EXISTS_ERROR;
    } catch (error) {
      if (error === EXISTS_ERROR) {
        throw error;
      }
    }
  }
  Deno.renameSync(src, dest);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL21vdmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IGlzU3ViZGlyIH0gZnJvbSBcIi4vX2lzX3N1YmRpci50c1wiO1xuaW1wb3J0IHsgaXNTYW1lUGF0aCB9IGZyb20gXCIuL19pc19zYW1lX3BhdGgudHNcIjtcblxuY29uc3QgRVhJU1RTX0VSUk9SID0gbmV3IERlbm8uZXJyb3JzLkFscmVhZHlFeGlzdHMoXCJkZXN0IGFscmVhZHkgZXhpc3RzLlwiKTtcblxuLyoqXG4gKiBFcnJvciB0aHJvd24gaW4ge0BsaW5rY29kZSBtb3ZlfSBvciB7QGxpbmtjb2RlIG1vdmVTeW5jfSB3aGVuIHRoZVxuICogZGVzdGluYXRpb24gaXMgYSBzdWJkaXJlY3Rvcnkgb2YgdGhlIHNvdXJjZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFN1YmRpcmVjdG9yeU1vdmVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqIENvbnN0cnVjdHMgYSBuZXcgaW5zdGFuY2UuICovXG4gIGNvbnN0cnVjdG9yKHNyYzogc3RyaW5nIHwgVVJMLCBkZXN0OiBzdHJpbmcgfCBVUkwpIHtcbiAgICBzdXBlcihcbiAgICAgIGBDYW5ub3QgbW92ZSAnJHtzcmN9JyB0byBhIHN1YmRpcmVjdG9yeSBvZiBpdHNlbGYsICcke2Rlc3R9Jy5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqIE9wdGlvbnMgZm9yIHtAbGlua2NvZGUgbW92ZX0gYW5kIHtAbGlua2NvZGUgbW92ZVN5bmN9LiAqL1xuZXhwb3J0IGludGVyZmFjZSBNb3ZlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBkZXN0aW5hdGlvbiBmaWxlIHNob3VsZCBiZSBvdmVyd3JpdHRlbiBpZiBpdCBhbHJlYWR5IGV4aXN0cy5cbiAgICpcbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgb3ZlcndyaXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNb3ZlcyBhIGZpbGUgb3IgZGlyZWN0b3J5LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgbW92ZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL21vZC50c1wiO1xuICpcbiAqIG1vdmUoXCIuL2Zvb1wiLCBcIi4vYmFyXCIpOyAvLyByZXR1cm5zIGEgcHJvbWlzZVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtb3ZlKFxuICBzcmM6IHN0cmluZyB8IFVSTCxcbiAgZGVzdDogc3RyaW5nIHwgVVJMLFxuICB7IG92ZXJ3cml0ZSA9IGZhbHNlIH06IE1vdmVPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3Qgc3JjU3RhdCA9IGF3YWl0IERlbm8uc3RhdChzcmMpO1xuXG4gIGlmIChcbiAgICBzcmNTdGF0LmlzRGlyZWN0b3J5ICYmXG4gICAgKGlzU3ViZGlyKHNyYywgZGVzdCkgfHwgaXNTYW1lUGF0aChzcmMsIGRlc3QpKVxuICApIHtcbiAgICB0aHJvdyBuZXcgU3ViZGlyZWN0b3J5TW92ZUVycm9yKHNyYywgZGVzdCk7XG4gIH1cblxuICBpZiAob3ZlcndyaXRlKSB7XG4gICAgaWYgKGlzU2FtZVBhdGgoc3JjLCBkZXN0KSkgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBEZW5vLnJlbW92ZShkZXN0LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBEZW5vLmxzdGF0KGRlc3QpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KEVYSVNUU19FUlJPUik7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBEbyBub3RoaW5nLi4uXG4gICAgfVxuICB9XG5cbiAgYXdhaXQgRGVuby5yZW5hbWUoc3JjLCBkZXN0KTtcbn1cblxuLyoqXG4gKiBNb3ZlcyBhIGZpbGUgb3IgZGlyZWN0b3J5IHN5bmNocm9ub3VzbHkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBtb3ZlU3luYyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL21vZC50c1wiO1xuICpcbiAqIG1vdmVTeW5jKFwiLi9mb29cIiwgXCIuL2JhclwiKTsgLy8gdm9pZFxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlU3luYyhcbiAgc3JjOiBzdHJpbmcgfCBVUkwsXG4gIGRlc3Q6IHN0cmluZyB8IFVSTCxcbiAgeyBvdmVyd3JpdGUgPSBmYWxzZSB9OiBNb3ZlT3B0aW9ucyA9IHt9LFxuKTogdm9pZCB7XG4gIGNvbnN0IHNyY1N0YXQgPSBEZW5vLnN0YXRTeW5jKHNyYyk7XG5cbiAgaWYgKFxuICAgIHNyY1N0YXQuaXNEaXJlY3RvcnkgJiZcbiAgICAoaXNTdWJkaXIoc3JjLCBkZXN0KSB8fCBpc1NhbWVQYXRoKHNyYywgZGVzdCkpXG4gICkge1xuICAgIHRocm93IG5ldyBTdWJkaXJlY3RvcnlNb3ZlRXJyb3Ioc3JjLCBkZXN0KTtcbiAgfVxuXG4gIGlmIChvdmVyd3JpdGUpIHtcbiAgICBpZiAoaXNTYW1lUGF0aChzcmMsIGRlc3QpKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIERlbm8ucmVtb3ZlU3luYyhkZXN0LCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBEZW5vLmxzdGF0U3luYyhkZXN0KTtcbiAgICAgIHRocm93IEVYSVNUU19FUlJPUjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yID09PSBFWElTVFNfRVJST1IpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgRGVuby5yZW5hbWVTeW5jKHNyYywgZGVzdCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsUUFBUSxRQUFRLGtCQUFrQjtBQUMzQyxTQUFTLFVBQVUsUUFBUSxxQkFBcUI7QUFFaEQsTUFBTSxlQUFlLElBQUksS0FBSyxNQUFNLENBQUMsYUFBYSxDQUFDO0FBRW5EOzs7Q0FHQyxHQUNELE9BQU8sTUFBTSw4QkFBOEI7RUFDekMsK0JBQStCLEdBQy9CLFlBQVksR0FBaUIsRUFBRSxJQUFrQixDQUFFO0lBQ2pELEtBQUssQ0FDSCxDQUFDLGFBQWEsRUFBRSxJQUFJLGdDQUFnQyxFQUFFLEtBQUssRUFBRSxDQUFDO0VBRWxFO0FBQ0Y7QUFZQTs7Ozs7Ozs7O0NBU0MsR0FDRCxPQUFPLGVBQWUsS0FDcEIsR0FBaUIsRUFDakIsSUFBa0IsRUFDbEIsRUFBRSxZQUFZLEtBQUssRUFBZSxHQUFHLENBQUMsQ0FBQztFQUV2QyxNQUFNLFVBQVUsTUFBTSxLQUFLLElBQUksQ0FBQztFQUVoQyxJQUNFLFFBQVEsV0FBVyxJQUNuQixDQUFDLFNBQVMsS0FBSyxTQUFTLFdBQVcsS0FBSyxLQUFLLEdBQzdDO0lBQ0EsTUFBTSxJQUFJLHNCQUFzQixLQUFLO0VBQ3ZDO0VBRUEsSUFBSSxXQUFXO0lBQ2IsSUFBSSxXQUFXLEtBQUssT0FBTztJQUMzQixJQUFJO01BQ0YsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNO1FBQUUsV0FBVztNQUFLO0lBQzVDLEVBQUUsT0FBTyxPQUFPO01BQ2QsSUFBSSxDQUFDLENBQUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLFFBQVEsR0FBRztRQUM1QyxNQUFNO01BQ1I7SUFDRjtFQUNGLE9BQU87SUFDTCxJQUFJO01BQ0YsTUFBTSxLQUFLLEtBQUssQ0FBQztNQUNqQixPQUFPLFFBQVEsTUFBTSxDQUFDO0lBQ3hCLEVBQUUsT0FBTTtJQUNOLGdCQUFnQjtJQUNsQjtFQUNGO0VBRUEsTUFBTSxLQUFLLE1BQU0sQ0FBQyxLQUFLO0FBQ3pCO0FBRUE7Ozs7Ozs7OztDQVNDLEdBQ0QsT0FBTyxTQUFTLFNBQ2QsR0FBaUIsRUFDakIsSUFBa0IsRUFDbEIsRUFBRSxZQUFZLEtBQUssRUFBZSxHQUFHLENBQUMsQ0FBQztFQUV2QyxNQUFNLFVBQVUsS0FBSyxRQUFRLENBQUM7RUFFOUIsSUFDRSxRQUFRLFdBQVcsSUFDbkIsQ0FBQyxTQUFTLEtBQUssU0FBUyxXQUFXLEtBQUssS0FBSyxHQUM3QztJQUNBLE1BQU0sSUFBSSxzQkFBc0IsS0FBSztFQUN2QztFQUVBLElBQUksV0FBVztJQUNiLElBQUksV0FBVyxLQUFLLE9BQU87SUFDM0IsSUFBSTtNQUNGLEtBQUssVUFBVSxDQUFDLE1BQU07UUFBRSxXQUFXO01BQUs7SUFDMUMsRUFBRSxPQUFPLE9BQU87TUFDZCxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsUUFBUSxHQUFHO1FBQzVDLE1BQU07TUFDUjtJQUNGO0VBQ0YsT0FBTztJQUNMLElBQUk7TUFDRixLQUFLLFNBQVMsQ0FBQztNQUNmLE1BQU07SUFDUixFQUFFLE9BQU8sT0FBTztNQUNkLElBQUksVUFBVSxjQUFjO1FBQzFCLE1BQU07TUFDUjtJQUNGO0VBQ0Y7RUFFQSxLQUFLLFVBQVUsQ0FBQyxLQUFLO0FBQ3ZCIn0=
// denoCacheMetadata=14560807708303238824,17917023691898707070
