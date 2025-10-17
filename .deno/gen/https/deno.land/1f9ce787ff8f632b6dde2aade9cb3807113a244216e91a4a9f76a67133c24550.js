// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// Documentation and interface for walk were adapted from Go
// https://golang.org/pkg/path/filepath/#Walk
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
import { join } from "../path/join.ts";
import { normalize } from "../path/normalize.ts";
import { createWalkEntry, createWalkEntrySync, toPathString } from "./_util.ts";
export class WalkError extends Error {
  cause;
  name = "WalkError";
  path;
  constructor(cause, path) {
    super(
      `${cause instanceof Error ? cause.message : cause} for path "${path}"`,
    );
    this.path = path;
    this.cause = cause;
  }
}
function include(path, exts, match, skip) {
  if (exts && !exts.some((ext) => path.endsWith(ext))) {
    return false;
  }
  if (match && !match.some((pattern) => !!path.match(pattern))) {
    return false;
  }
  if (skip && skip.some((pattern) => !!path.match(pattern))) {
    return false;
  }
  return true;
}
function wrapErrorWithPath(err, root) {
  if (err instanceof WalkError) return err;
  return new WalkError(err, root);
}
/**
 * Walks the file tree rooted at root, yielding each file or directory in the
 * tree filtered according to the given options.
 *
 * @example
 * ```ts
 * import { walk } from "https://deno.land/std@$STD_VERSION/fs/walk.ts";
 * import { assert } from "https://deno.land/std@$STD_VERSION/assert/assert.ts";
 *
 * for await (const entry of walk(".")) {
 *   console.log(entry.path);
 *   assert(entry.isFile);
 * }
 * ```
 */ export async function* walk(
  root,
  {
    maxDepth = Infinity,
    includeFiles = true,
    includeDirs = true,
    includeSymlinks = true,
    followSymlinks = false,
    canonicalize = true,
    exts = undefined,
    match = undefined,
    skip = undefined,
  } = {},
) {
  if (maxDepth < 0) {
    return;
  }
  root = toPathString(root);
  if (includeDirs && include(root, exts, match, skip)) {
    yield await createWalkEntry(root);
  }
  if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
    return;
  }
  try {
    for await (const entry of Deno.readDir(root)) {
      let path = join(root, entry.name);
      let { isSymlink, isDirectory } = entry;
      if (isSymlink) {
        if (!followSymlinks) {
          if (includeSymlinks && include(path, exts, match, skip)) {
            yield {
              path,
              ...entry,
            };
          }
          continue;
        }
        const realPath = await Deno.realPath(path);
        if (canonicalize) {
          path = realPath;
        }
        // Caveat emptor: don't assume |path| is not a symlink. realpath()
        // resolves symlinks but another process can replace the file system
        // entity with a different type of entity before we call lstat().
        ({ isSymlink, isDirectory } = await Deno.lstat(realPath));
      }
      if (isSymlink || isDirectory) {
        yield* walk(path, {
          maxDepth: maxDepth - 1,
          includeFiles,
          includeDirs,
          includeSymlinks,
          followSymlinks,
          exts,
          match,
          skip,
        });
      } else if (includeFiles && include(path, exts, match, skip)) {
        yield {
          path,
          ...entry,
        };
      }
    }
  } catch (err) {
    throw wrapErrorWithPath(err, normalize(root));
  }
}
/** Same as walk() but uses synchronous ops */ export function* walkSync(
  root,
  {
    maxDepth = Infinity,
    includeFiles = true,
    includeDirs = true,
    includeSymlinks = true,
    followSymlinks = false,
    canonicalize = true,
    exts = undefined,
    match = undefined,
    skip = undefined,
  } = {},
) {
  root = toPathString(root);
  if (maxDepth < 0) {
    return;
  }
  if (includeDirs && include(root, exts, match, skip)) {
    yield createWalkEntrySync(root);
  }
  if (maxDepth < 1 || !include(root, undefined, undefined, skip)) {
    return;
  }
  let entries;
  try {
    entries = Deno.readDirSync(root);
  } catch (err) {
    throw wrapErrorWithPath(err, normalize(root));
  }
  for (const entry of entries) {
    let path = join(root, entry.name);
    let { isSymlink, isDirectory } = entry;
    if (isSymlink) {
      if (!followSymlinks) {
        if (includeSymlinks && include(path, exts, match, skip)) {
          yield {
            path,
            ...entry,
          };
        }
        continue;
      }
      const realPath = Deno.realPathSync(path);
      if (canonicalize) {
        path = realPath;
      }
      // Caveat emptor: don't assume |path| is not a symlink. realpath()
      // resolves symlinks but another process can replace the file system
      // entity with a different type of entity before we call lstat().
      ({ isSymlink, isDirectory } = Deno.lstatSync(realPath));
    }
    if (isSymlink || isDirectory) {
      yield* walkSync(path, {
        maxDepth: maxDepth - 1,
        includeFiles,
        includeDirs,
        includeSymlinks,
        followSymlinks,
        exts,
        match,
        skip,
      });
    } else if (includeFiles && include(path, exts, match, skip)) {
      yield {
        path,
        ...entry,
      };
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwOC4wL2ZzL3dhbGsudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIERvY3VtZW50YXRpb24gYW5kIGludGVyZmFjZSBmb3Igd2FsayB3ZXJlIGFkYXB0ZWQgZnJvbSBHb1xuLy8gaHR0cHM6Ly9nb2xhbmcub3JnL3BrZy9wYXRoL2ZpbGVwYXRoLyNXYWxrXG4vLyBDb3B5cmlnaHQgMjAwOSBUaGUgR28gQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gQlNEIGxpY2Vuc2UuXG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIi4uL3BhdGgvam9pbi50c1wiO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSBcIi4uL3BhdGgvbm9ybWFsaXplLnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVXYWxrRW50cnksXG4gIGNyZWF0ZVdhbGtFbnRyeVN5bmMsXG4gIHRvUGF0aFN0cmluZyxcbiAgV2Fsa0VudHJ5LFxufSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5leHBvcnQgY2xhc3MgV2Fsa0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBvdmVycmlkZSBjYXVzZTogdW5rbm93bjtcbiAgb3ZlcnJpZGUgbmFtZSA9IFwiV2Fsa0Vycm9yXCI7XG4gIHBhdGg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihjYXVzZTogdW5rbm93biwgcGF0aDogc3RyaW5nKSB7XG4gICAgc3VwZXIoXG4gICAgICBgJHtjYXVzZSBpbnN0YW5jZW9mIEVycm9yID8gY2F1c2UubWVzc2FnZSA6IGNhdXNlfSBmb3IgcGF0aCBcIiR7cGF0aH1cImAsXG4gICAgKTtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMuY2F1c2UgPSBjYXVzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmNsdWRlKFxuICBwYXRoOiBzdHJpbmcsXG4gIGV4dHM/OiBzdHJpbmdbXSxcbiAgbWF0Y2g/OiBSZWdFeHBbXSxcbiAgc2tpcD86IFJlZ0V4cFtdLFxuKTogYm9vbGVhbiB7XG4gIGlmIChleHRzICYmICFleHRzLnNvbWUoKGV4dCk6IGJvb2xlYW4gPT4gcGF0aC5lbmRzV2l0aChleHQpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAobWF0Y2ggJiYgIW1hdGNoLnNvbWUoKHBhdHRlcm4pOiBib29sZWFuID0+ICEhcGF0aC5tYXRjaChwYXR0ZXJuKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHNraXAgJiYgc2tpcC5zb21lKChwYXR0ZXJuKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocGF0dGVybikpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiB3cmFwRXJyb3JXaXRoUGF0aChlcnI6IHVua25vd24sIHJvb3Q6IHN0cmluZykge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgV2Fsa0Vycm9yKSByZXR1cm4gZXJyO1xuICByZXR1cm4gbmV3IFdhbGtFcnJvcihlcnIsIHJvb3QpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdhbGtPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSBtYXhpbXVtIGRlcHRoIG9mIHRoZSBmaWxlIHRyZWUgdG8gYmUgd2Fsa2VkIHJlY3Vyc2l2ZWx5LlxuICAgKiBAZGVmYXVsdCB7SW5maW5pdHl9XG4gICAqL1xuICBtYXhEZXB0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIGZpbGUgZW50cmllcyBzaG91bGQgYmUgaW5jbHVkZWQgb3Igbm90LlxuICAgKiBAZGVmYXVsdCB7dHJ1ZX1cbiAgICovXG4gIGluY2x1ZGVGaWxlcz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciBkaXJlY3RvcnkgZW50cmllcyBzaG91bGQgYmUgaW5jbHVkZWQgb3Igbm90LlxuICAgKiBAZGVmYXVsdCB7dHJ1ZX1cbiAgICovXG4gIGluY2x1ZGVEaXJzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHN5bWxpbmsgZW50cmllcyBzaG91bGQgYmUgaW5jbHVkZWQgb3Igbm90LlxuICAgKiBUaGlzIG9wdGlvbiBpcyBtZWFuaW5nZnVsIG9ubHkgaWYgYGZvbGxvd1N5bWxpbmtzYCBpcyBzZXQgdG8gYGZhbHNlYC5cbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBpbmNsdWRlU3ltbGlua3M/OiBib29sZWFuO1xuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgc3ltbGlua3Mgc2hvdWxkIGJlIHJlc29sdmVkIG9yIG5vdC5cbiAgICogQGRlZmF1bHQge2ZhbHNlfVxuICAgKi9cbiAgZm9sbG93U3ltbGlua3M/OiBib29sZWFuO1xuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGZvbGxvd2VkIHN5bWxpbmsncyBwYXRoIHNob3VsZCBiZSBjYW5vbmljYWxpemVkLlxuICAgKiBUaGlzIG9wdGlvbiB3b3JrcyBvbmx5IGlmIGBmb2xsb3dTeW1saW5rc2AgaXMgbm90IGBmYWxzZWAuXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgY2Fub25pY2FsaXplPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIExpc3Qgb2YgZmlsZSBleHRlbnNpb25zIHVzZWQgdG8gZmlsdGVyIGVudHJpZXMuXG4gICAqIElmIHNwZWNpZmllZCwgZW50cmllcyB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiBzcGVjaWZpZWQgYnkgdGhpcyBvcHRpb24gYXJlIGV4Y2x1ZGVkLlxuICAgKiBAZGVmYXVsdCB7dW5kZWZpbmVkfVxuICAgKi9cbiAgZXh0cz86IHN0cmluZ1tdO1xuICAvKipcbiAgICogTGlzdCBvZiByZWd1bGFyIGV4cHJlc3Npb24gcGF0dGVybnMgdXNlZCB0byBmaWx0ZXIgZW50cmllcy5cbiAgICogSWYgc3BlY2lmaWVkLCBlbnRyaWVzIHRoYXQgZG8gbm90IG1hdGNoIHRoZSBwYXR0ZXJucyBzcGVjaWZpZWQgYnkgdGhpcyBvcHRpb24gYXJlIGV4Y2x1ZGVkLlxuICAgKiBAZGVmYXVsdCB7dW5kZWZpbmVkfVxuICAgKi9cbiAgbWF0Y2g/OiBSZWdFeHBbXTtcbiAgLyoqXG4gICAqIExpc3Qgb2YgcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5zIHVzZWQgdG8gZmlsdGVyIGVudHJpZXMuXG4gICAqIElmIHNwZWNpZmllZCwgZW50cmllcyBtYXRjaGluZyB0aGUgcGF0dGVybnMgc3BlY2lmaWVkIGJ5IHRoaXMgb3B0aW9uIGFyZSBleGNsdWRlZC5cbiAgICogQGRlZmF1bHQge3VuZGVmaW5lZH1cbiAgICovXG4gIHNraXA/OiBSZWdFeHBbXTtcbn1cbmV4cG9ydCB0eXBlIHsgV2Fsa0VudHJ5IH07XG5cbi8qKlxuICogV2Fsa3MgdGhlIGZpbGUgdHJlZSByb290ZWQgYXQgcm9vdCwgeWllbGRpbmcgZWFjaCBmaWxlIG9yIGRpcmVjdG9yeSBpbiB0aGVcbiAqIHRyZWUgZmlsdGVyZWQgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBvcHRpb25zLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgd2FsayB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL3dhbGsudHNcIjtcbiAqIGltcG9ydCB7IGFzc2VydCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2Fzc2VydC9hc3NlcnQudHNcIjtcbiAqXG4gKiBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIHdhbGsoXCIuXCIpKSB7XG4gKiAgIGNvbnNvbGUubG9nKGVudHJ5LnBhdGgpO1xuICogICBhc3NlcnQoZW50cnkuaXNGaWxlKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIHdhbGsoXG4gIHJvb3Q6IHN0cmluZyB8IFVSTCxcbiAge1xuICAgIG1heERlcHRoID0gSW5maW5pdHksXG4gICAgaW5jbHVkZUZpbGVzID0gdHJ1ZSxcbiAgICBpbmNsdWRlRGlycyA9IHRydWUsXG4gICAgaW5jbHVkZVN5bWxpbmtzID0gdHJ1ZSxcbiAgICBmb2xsb3dTeW1saW5rcyA9IGZhbHNlLFxuICAgIGNhbm9uaWNhbGl6ZSA9IHRydWUsXG4gICAgZXh0cyA9IHVuZGVmaW5lZCxcbiAgICBtYXRjaCA9IHVuZGVmaW5lZCxcbiAgICBza2lwID0gdW5kZWZpbmVkLFxuICB9OiBXYWxrT3B0aW9ucyA9IHt9LFxuKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFdhbGtFbnRyeT4ge1xuICBpZiAobWF4RGVwdGggPCAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJvb3QgPSB0b1BhdGhTdHJpbmcocm9vdCk7XG4gIGlmIChpbmNsdWRlRGlycyAmJiBpbmNsdWRlKHJvb3QsIGV4dHMsIG1hdGNoLCBza2lwKSkge1xuICAgIHlpZWxkIGF3YWl0IGNyZWF0ZVdhbGtFbnRyeShyb290KTtcbiAgfVxuICBpZiAobWF4RGVwdGggPCAxIHx8ICFpbmNsdWRlKHJvb3QsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBza2lwKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGZvciBhd2FpdCAoY29uc3QgZW50cnkgb2YgRGVuby5yZWFkRGlyKHJvb3QpKSB7XG4gICAgICBsZXQgcGF0aCA9IGpvaW4ocm9vdCwgZW50cnkubmFtZSk7XG5cbiAgICAgIGxldCB7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IGVudHJ5O1xuXG4gICAgICBpZiAoaXNTeW1saW5rKSB7XG4gICAgICAgIGlmICghZm9sbG93U3ltbGlua3MpIHtcbiAgICAgICAgICBpZiAoaW5jbHVkZVN5bWxpbmtzICYmIGluY2x1ZGUocGF0aCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgICAgICAgICB5aWVsZCB7IHBhdGgsIC4uLmVudHJ5IH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlYWxQYXRoID0gYXdhaXQgRGVuby5yZWFsUGF0aChwYXRoKTtcbiAgICAgICAgaWYgKGNhbm9uaWNhbGl6ZSkge1xuICAgICAgICAgIHBhdGggPSByZWFsUGF0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYXZlYXQgZW1wdG9yOiBkb24ndCBhc3N1bWUgfHBhdGh8IGlzIG5vdCBhIHN5bWxpbmsuIHJlYWxwYXRoKClcbiAgICAgICAgLy8gcmVzb2x2ZXMgc3ltbGlua3MgYnV0IGFub3RoZXIgcHJvY2VzcyBjYW4gcmVwbGFjZSB0aGUgZmlsZSBzeXN0ZW1cbiAgICAgICAgLy8gZW50aXR5IHdpdGggYSBkaWZmZXJlbnQgdHlwZSBvZiBlbnRpdHkgYmVmb3JlIHdlIGNhbGwgbHN0YXQoKS5cbiAgICAgICAgKHsgaXNTeW1saW5rLCBpc0RpcmVjdG9yeSB9ID0gYXdhaXQgRGVuby5sc3RhdChyZWFsUGF0aCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNTeW1saW5rIHx8IGlzRGlyZWN0b3J5KSB7XG4gICAgICAgIHlpZWxkKiB3YWxrKHBhdGgsIHtcbiAgICAgICAgICBtYXhEZXB0aDogbWF4RGVwdGggLSAxLFxuICAgICAgICAgIGluY2x1ZGVGaWxlcyxcbiAgICAgICAgICBpbmNsdWRlRGlycyxcbiAgICAgICAgICBpbmNsdWRlU3ltbGlua3MsXG4gICAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICAgICAgZXh0cyxcbiAgICAgICAgICBtYXRjaCxcbiAgICAgICAgICBza2lwLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoaW5jbHVkZUZpbGVzICYmIGluY2x1ZGUocGF0aCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgICAgIHlpZWxkIHsgcGF0aCwgLi4uZW50cnkgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IHdyYXBFcnJvcldpdGhQYXRoKGVyciwgbm9ybWFsaXplKHJvb3QpKTtcbiAgfVxufVxuXG4vKiogU2FtZSBhcyB3YWxrKCkgYnV0IHVzZXMgc3luY2hyb25vdXMgb3BzICovXG5leHBvcnQgZnVuY3Rpb24qIHdhbGtTeW5jKFxuICByb290OiBzdHJpbmcgfCBVUkwsXG4gIHtcbiAgICBtYXhEZXB0aCA9IEluZmluaXR5LFxuICAgIGluY2x1ZGVGaWxlcyA9IHRydWUsXG4gICAgaW5jbHVkZURpcnMgPSB0cnVlLFxuICAgIGluY2x1ZGVTeW1saW5rcyA9IHRydWUsXG4gICAgZm9sbG93U3ltbGlua3MgPSBmYWxzZSxcbiAgICBjYW5vbmljYWxpemUgPSB0cnVlLFxuICAgIGV4dHMgPSB1bmRlZmluZWQsXG4gICAgbWF0Y2ggPSB1bmRlZmluZWQsXG4gICAgc2tpcCA9IHVuZGVmaW5lZCxcbiAgfTogV2Fsa09wdGlvbnMgPSB7fSxcbik6IEl0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gIHJvb3QgPSB0b1BhdGhTdHJpbmcocm9vdCk7XG4gIGlmIChtYXhEZXB0aCA8IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGluY2x1ZGVEaXJzICYmIGluY2x1ZGUocm9vdCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgeWllbGQgY3JlYXRlV2Fsa0VudHJ5U3luYyhyb290KTtcbiAgfVxuICBpZiAobWF4RGVwdGggPCAxIHx8ICFpbmNsdWRlKHJvb3QsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBza2lwKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgZW50cmllcztcbiAgdHJ5IHtcbiAgICBlbnRyaWVzID0gRGVuby5yZWFkRGlyU3luYyhyb290KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgd3JhcEVycm9yV2l0aFBhdGgoZXJyLCBub3JtYWxpemUocm9vdCkpO1xuICB9XG4gIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgIGxldCBwYXRoID0gam9pbihyb290LCBlbnRyeS5uYW1lKTtcblxuICAgIGxldCB7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IGVudHJ5O1xuXG4gICAgaWYgKGlzU3ltbGluaykge1xuICAgICAgaWYgKCFmb2xsb3dTeW1saW5rcykge1xuICAgICAgICBpZiAoaW5jbHVkZVN5bWxpbmtzICYmIGluY2x1ZGUocGF0aCwgZXh0cywgbWF0Y2gsIHNraXApKSB7XG4gICAgICAgICAgeWllbGQgeyBwYXRoLCAuLi5lbnRyeSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVhbFBhdGggPSBEZW5vLnJlYWxQYXRoU3luYyhwYXRoKTtcbiAgICAgIGlmIChjYW5vbmljYWxpemUpIHtcbiAgICAgICAgcGF0aCA9IHJlYWxQYXRoO1xuICAgICAgfVxuICAgICAgLy8gQ2F2ZWF0IGVtcHRvcjogZG9uJ3QgYXNzdW1lIHxwYXRofCBpcyBub3QgYSBzeW1saW5rLiByZWFscGF0aCgpXG4gICAgICAvLyByZXNvbHZlcyBzeW1saW5rcyBidXQgYW5vdGhlciBwcm9jZXNzIGNhbiByZXBsYWNlIHRoZSBmaWxlIHN5c3RlbVxuICAgICAgLy8gZW50aXR5IHdpdGggYSBkaWZmZXJlbnQgdHlwZSBvZiBlbnRpdHkgYmVmb3JlIHdlIGNhbGwgbHN0YXQoKS5cbiAgICAgICh7IGlzU3ltbGluaywgaXNEaXJlY3RvcnkgfSA9IERlbm8ubHN0YXRTeW5jKHJlYWxQYXRoKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzU3ltbGluayB8fCBpc0RpcmVjdG9yeSkge1xuICAgICAgeWllbGQqIHdhbGtTeW5jKHBhdGgsIHtcbiAgICAgICAgbWF4RGVwdGg6IG1heERlcHRoIC0gMSxcbiAgICAgICAgaW5jbHVkZUZpbGVzLFxuICAgICAgICBpbmNsdWRlRGlycyxcbiAgICAgICAgaW5jbHVkZVN5bWxpbmtzLFxuICAgICAgICBmb2xsb3dTeW1saW5rcyxcbiAgICAgICAgZXh0cyxcbiAgICAgICAgbWF0Y2gsXG4gICAgICAgIHNraXAsXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGluY2x1ZGVGaWxlcyAmJiBpbmNsdWRlKHBhdGgsIGV4dHMsIG1hdGNoLCBza2lwKSkge1xuICAgICAgeWllbGQgeyBwYXRoLCAuLi5lbnRyeSB9O1xuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSw0REFBNEQ7QUFDNUQsNkNBQTZDO0FBQzdDLG1FQUFtRTtBQUNuRSxTQUFTLElBQUksUUFBUSxrQkFBa0I7QUFDdkMsU0FBUyxTQUFTLFFBQVEsdUJBQXVCO0FBQ2pELFNBQ0UsZUFBZSxFQUNmLG1CQUFtQixFQUNuQixZQUFZLFFBRVAsYUFBYTtBQUVwQixPQUFPLE1BQU0sa0JBQWtCO0VBQ3BCLE1BQWU7RUFDZixPQUFPLFlBQVk7RUFDNUIsS0FBYTtFQUViLFlBQVksS0FBYyxFQUFFLElBQVksQ0FBRTtJQUN4QyxLQUFLLENBQ0gsR0FBRyxpQkFBaUIsUUFBUSxNQUFNLE9BQU8sR0FBRyxNQUFNLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV4RSxJQUFJLENBQUMsSUFBSSxHQUFHO0lBQ1osSUFBSSxDQUFDLEtBQUssR0FBRztFQUNmO0FBQ0Y7QUFFQSxTQUFTLFFBQ1AsSUFBWSxFQUNaLElBQWUsRUFDZixLQUFnQixFQUNoQixJQUFlO0VBRWYsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxNQUFpQixLQUFLLFFBQVEsQ0FBQyxPQUFPO0lBQzVELE9BQU87RUFDVDtFQUNBLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBcUIsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFdBQVc7SUFDckUsT0FBTztFQUNUO0VBQ0EsSUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsVUFBcUIsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFdBQVc7SUFDbEUsT0FBTztFQUNUO0VBQ0EsT0FBTztBQUNUO0FBRUEsU0FBUyxrQkFBa0IsR0FBWSxFQUFFLElBQVk7RUFDbkQsSUFBSSxlQUFlLFdBQVcsT0FBTztFQUNy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
// denoCacheMetadata=11959032113437054167,1025437785742310531
