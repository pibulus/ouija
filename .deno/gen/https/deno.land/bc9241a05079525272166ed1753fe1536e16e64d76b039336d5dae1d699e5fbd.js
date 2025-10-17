// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { globToRegExp } from "../path/glob_to_regexp.ts";
import { joinGlobs } from "../path/join_globs.ts";
import { isGlob } from "../path/is_glob.ts";
import { isAbsolute } from "../path/is_absolute.ts";
import { resolve } from "../path/resolve.ts";
import { SEPARATOR_PATTERN } from "../path/constants.ts";
import { walk, walkSync } from "./walk.ts";
import { assert } from "../assert/assert.ts";
import { toPathString } from "./_to_path_string.ts";
import { createWalkEntry, createWalkEntrySync } from "./_create_walk_entry.ts";
const isWindows = Deno.build.os === "windows";
function split(path) {
  const s = SEPARATOR_PATTERN.source;
  const segments = path.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(
    SEPARATOR_PATTERN,
  );
  const isAbsolute_ = isAbsolute(path);
  return {
    segments,
    isAbsolute: isAbsolute_,
    hasTrailingSep: !!path.match(new RegExp(`${s}$`)),
    winRoot: isWindows && isAbsolute_ ? segments.shift() : undefined,
  };
}
function throwUnlessNotFound(error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error;
  }
}
function comparePath(a, b) {
  if (a.path < b.path) return -1;
  if (a.path > b.path) return 1;
  return 0;
}
/**
 * Expand the glob string from the specified `root` directory and yield each
 * result as a `WalkEntry` object.
 *
 * See [`globToRegExp()`](../path/glob.ts#globToRegExp) for details on supported
 * syntax.
 *
 * @example
 * ```ts
 * import { expandGlob } from "https://deno.land/std@$STD_VERSION/fs/expand_glob.ts";
 * for await (const file of expandGlob("**\/*.ts")) {
 *   console.log(file);
 * }
 * ```
 */ export async function* expandGlob(
  glob,
  {
    root,
    exclude = [],
    includeDirs = true,
    extended = true,
    globstar = true,
    caseInsensitive,
    followSymlinks,
    canonicalize,
  } = {},
) {
  const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } =
    split(toPathString(glob));
  root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
  const globOptions = {
    extended,
    globstar,
    caseInsensitive,
  };
  const absRoot = isGlobAbsolute ? root : resolve(root); // root is always string here
  const resolveFromRoot = (path) => resolve(absRoot, path);
  const excludePatterns = exclude.map(resolveFromRoot).map((s) =>
    globToRegExp(s, globOptions)
  );
  const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
  let fixedRoot = isGlobAbsolute
    ? winRoot !== undefined ? winRoot : "/"
    : absRoot;
  while (segments.length > 0 && !isGlob(segments[0])) {
    const seg = segments.shift();
    assert(seg !== undefined);
    fixedRoot = joinGlobs([
      fixedRoot,
      seg,
    ], globOptions);
  }
  let fixedRootInfo;
  try {
    fixedRootInfo = await createWalkEntry(fixedRoot);
  } catch (error) {
    return throwUnlessNotFound(error);
  }
  async function* advanceMatch(walkInfo, globSegment) {
    if (!walkInfo.isDirectory) {
      return;
    } else if (globSegment === "..") {
      const parentPath = joinGlobs([
        walkInfo.path,
        "..",
      ], globOptions);
      try {
        if (shouldInclude(parentPath)) {
          return yield await createWalkEntry(parentPath);
        }
      } catch (error) {
        throwUnlessNotFound(error);
      }
      return;
    } else if (globSegment === "**") {
      return yield* walk(walkInfo.path, {
        skip: excludePatterns,
        maxDepth: globstar ? Infinity : 1,
        followSymlinks,
        canonicalize,
      });
    }
    const globPattern = globToRegExp(globSegment, globOptions);
    for await (
      const walkEntry of walk(walkInfo.path, {
        maxDepth: 1,
        skip: excludePatterns,
        followSymlinks,
      })
    ) {
      if (
        walkEntry.path !== walkInfo.path && walkEntry.name.match(globPattern)
      ) {
        yield walkEntry;
      }
    }
  }
  let currentMatches = [
    fixedRootInfo,
  ];
  for (const segment of segments) {
    // Advancing the list of current matches may introduce duplicates, so we
    // pass everything through this Map.
    const nextMatchMap = new Map();
    await Promise.all(currentMatches.map(async (currentMatch) => {
      for await (const nextMatch of advanceMatch(currentMatch, segment)) {
        nextMatchMap.set(nextMatch.path, nextMatch);
      }
    }));
    currentMatches = [
      ...nextMatchMap.values(),
    ].sort(comparePath);
  }
  if (hasTrailingSep) {
    currentMatches = currentMatches.filter((entry) => entry.isDirectory);
  }
  if (!includeDirs) {
    currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
  }
  yield* currentMatches;
}
/**
 * Synchronous version of `expandGlob()`.
 *
 * @example
 * ```ts
 * import { expandGlobSync } from "https://deno.land/std@$STD_VERSION/fs/expand_glob.ts";
 * for (const file of expandGlobSync("**\/*.ts")) {
 *   console.log(file);
 * }
 * ```
 */ export function* expandGlobSync(
  glob,
  {
    root,
    exclude = [],
    includeDirs = true,
    extended = true,
    globstar = true,
    caseInsensitive,
    followSymlinks,
    canonicalize,
  } = {},
) {
  const { segments, isAbsolute: isGlobAbsolute, hasTrailingSep, winRoot } =
    split(toPathString(glob));
  root ??= isGlobAbsolute ? winRoot ?? "/" : Deno.cwd();
  const globOptions = {
    extended,
    globstar,
    caseInsensitive,
  };
  const absRoot = isGlobAbsolute ? root : resolve(root); // root is always string here
  const resolveFromRoot = (path) => resolve(absRoot, path);
  const excludePatterns = exclude.map(resolveFromRoot).map((s) =>
    globToRegExp(s, globOptions)
  );
  const shouldInclude = (path) => !excludePatterns.some((p) => !!path.match(p));
  let fixedRoot = isGlobAbsolute
    ? winRoot !== undefined ? winRoot : "/"
    : absRoot;
  while (segments.length > 0 && !isGlob(segments[0])) {
    const seg = segments.shift();
    assert(seg !== undefined);
    fixedRoot = joinGlobs([
      fixedRoot,
      seg,
    ], globOptions);
  }
  let fixedRootInfo;
  try {
    fixedRootInfo = createWalkEntrySync(fixedRoot);
  } catch (error) {
    return throwUnlessNotFound(error);
  }
  function* advanceMatch(walkInfo, globSegment) {
    if (!walkInfo.isDirectory) {
      return;
    } else if (globSegment === "..") {
      const parentPath = joinGlobs([
        walkInfo.path,
        "..",
      ], globOptions);
      try {
        if (shouldInclude(parentPath)) {
          return yield createWalkEntrySync(parentPath);
        }
      } catch (error) {
        throwUnlessNotFound(error);
      }
      return;
    } else if (globSegment === "**") {
      return yield* walkSync(walkInfo.path, {
        skip: excludePatterns,
        maxDepth: globstar ? Infinity : 1,
        followSymlinks,
        canonicalize,
      });
    }
    const globPattern = globToRegExp(globSegment, globOptions);
    for (
      const walkEntry of walkSync(walkInfo.path, {
        maxDepth: 1,
        skip: excludePatterns,
        followSymlinks,
      })
    ) {
      if (
        walkEntry.path !== walkInfo.path && walkEntry.name.match(globPattern)
      ) {
        yield walkEntry;
      }
    }
  }
  let currentMatches = [
    fixedRootInfo,
  ];
  for (const segment of segments) {
    // Advancing the list of current matches may introduce duplicates, so we
    // pass everything through this Map.
    const nextMatchMap = new Map();
    for (const currentMatch of currentMatches) {
      for (const nextMatch of advanceMatch(currentMatch, segment)) {
        nextMatchMap.set(nextMatch.path, nextMatch);
      }
    }
    currentMatches = [
      ...nextMatchMap.values(),
    ].sort(comparePath);
  }
  if (hasTrailingSep) {
    currentMatches = currentMatches.filter((entry) => entry.isDirectory);
  }
  if (!includeDirs) {
    currentMatches = currentMatches.filter((entry) => !entry.isDirectory);
  }
  yield* currentMatches;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL2V4cGFuZF9nbG9iLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyB0eXBlIEdsb2JPcHRpb25zLCBnbG9iVG9SZWdFeHAgfSBmcm9tIFwiLi4vcGF0aC9nbG9iX3RvX3JlZ2V4cC50c1wiO1xuaW1wb3J0IHsgam9pbkdsb2JzIH0gZnJvbSBcIi4uL3BhdGgvam9pbl9nbG9icy50c1wiO1xuaW1wb3J0IHsgaXNHbG9iIH0gZnJvbSBcIi4uL3BhdGgvaXNfZ2xvYi50c1wiO1xuaW1wb3J0IHsgaXNBYnNvbHV0ZSB9IGZyb20gXCIuLi9wYXRoL2lzX2Fic29sdXRlLnRzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcIi4uL3BhdGgvcmVzb2x2ZS50c1wiO1xuaW1wb3J0IHsgU0VQQVJBVE9SX1BBVFRFUk4gfSBmcm9tIFwiLi4vcGF0aC9jb25zdGFudHMudHNcIjtcbmltcG9ydCB7IHdhbGssIHdhbGtTeW5jIH0gZnJvbSBcIi4vd2Fsay50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcIi4uL2Fzc2VydC9hc3NlcnQudHNcIjtcbmltcG9ydCB7IHRvUGF0aFN0cmluZyB9IGZyb20gXCIuL190b19wYXRoX3N0cmluZy50c1wiO1xuaW1wb3J0IHtcbiAgY3JlYXRlV2Fsa0VudHJ5LFxuICBjcmVhdGVXYWxrRW50cnlTeW5jLFxuICB0eXBlIFdhbGtFbnRyeSxcbn0gZnJvbSBcIi4vX2NyZWF0ZV93YWxrX2VudHJ5LnRzXCI7XG5cbmV4cG9ydCB0eXBlIHsgR2xvYk9wdGlvbnMgfTtcblxuY29uc3QgaXNXaW5kb3dzID0gRGVuby5idWlsZC5vcyA9PT0gXCJ3aW5kb3dzXCI7XG5cbi8qKiBPcHRpb25zIGZvciB7QGxpbmtjb2RlIGV4cGFuZEdsb2J9IGFuZCB7QGxpbmtjb2RlIGV4cGFuZEdsb2JTeW5jfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwYW5kR2xvYk9wdGlvbnMgZXh0ZW5kcyBPbWl0PEdsb2JPcHRpb25zLCBcIm9zXCI+IHtcbiAgLyoqIEZpbGUgcGF0aCB3aGVyZSB0byBleHBhbmQgZnJvbS4gKi9cbiAgcm9vdD86IHN0cmluZztcbiAgLyoqIExpc3Qgb2YgZ2xvYiBwYXR0ZXJucyB0byBiZSBleGNsdWRlZCBmcm9tIHRoZSBleHBhbnNpb24uICovXG4gIGV4Y2x1ZGU/OiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gaW5jbHVkZSBkaXJlY3RvcmllcyBpbiBlbnRyaWVzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7dHJ1ZX1cbiAgICovXG4gIGluY2x1ZGVEaXJzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZm9sbG93IHN5bWJvbGljIGxpbmtzLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqL1xuICBmb2xsb3dTeW1saW5rcz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZm9sbG93ZWQgc3ltbGluaydzIHBhdGggc2hvdWxkIGJlIGNhbm9uaWNhbGl6ZWQuXG4gICAqIFRoaXMgb3B0aW9uIHdvcmtzIG9ubHkgaWYgYGZvbGxvd1N5bWxpbmtzYCBpcyBub3QgYGZhbHNlYC5cbiAgICpcbiAgICogQGRlZmF1bHQge3RydWV9XG4gICAqL1xuICBjYW5vbmljYWxpemU/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgU3BsaXRQYXRoIHtcbiAgc2VnbWVudHM6IHN0cmluZ1tdO1xuICBpc0Fic29sdXRlOiBib29sZWFuO1xuICBoYXNUcmFpbGluZ1NlcDogYm9vbGVhbjtcbiAgLy8gRGVmaW5lZCBmb3IgYW55IGFic29sdXRlIFdpbmRvd3MgcGF0aC5cbiAgd2luUm9vdD86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gc3BsaXQocGF0aDogc3RyaW5nKTogU3BsaXRQYXRoIHtcbiAgY29uc3QgcyA9IFNFUEFSQVRPUl9QQVRURVJOLnNvdXJjZTtcbiAgY29uc3Qgc2VnbWVudHMgPSBwYXRoXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7c318JHtzfSRgLCBcImdcIiksIFwiXCIpXG4gICAgLnNwbGl0KFNFUEFSQVRPUl9QQVRURVJOKTtcbiAgY29uc3QgaXNBYnNvbHV0ZV8gPSBpc0Fic29sdXRlKHBhdGgpO1xuICByZXR1cm4ge1xuICAgIHNlZ21lbnRzLFxuICAgIGlzQWJzb2x1dGU6IGlzQWJzb2x1dGVfLFxuICAgIGhhc1RyYWlsaW5nU2VwOiAhIXBhdGgubWF0Y2gobmV3IFJlZ0V4cChgJHtzfSRgKSksXG4gICAgd2luUm9vdDogaXNXaW5kb3dzICYmIGlzQWJzb2x1dGVfID8gc2VnbWVudHMuc2hpZnQoKSA6IHVuZGVmaW5lZCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcjogdW5rbm93bikge1xuICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLk5vdEZvdW5kKSkge1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVQYXRoKGE6IFdhbGtFbnRyeSwgYjogV2Fsa0VudHJ5KTogbnVtYmVyIHtcbiAgaWYgKGEucGF0aCA8IGIucGF0aCkgcmV0dXJuIC0xO1xuICBpZiAoYS5wYXRoID4gYi5wYXRoKSByZXR1cm4gMTtcbiAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogRXhwYW5kIHRoZSBnbG9iIHN0cmluZyBmcm9tIHRoZSBzcGVjaWZpZWQgYHJvb3RgIGRpcmVjdG9yeSBhbmQgeWllbGQgZWFjaFxuICogcmVzdWx0IGFzIGEgYFdhbGtFbnRyeWAgb2JqZWN0LlxuICpcbiAqIFNlZSBbYGdsb2JUb1JlZ0V4cCgpYF0oLi4vcGF0aC9nbG9iLnRzI2dsb2JUb1JlZ0V4cCkgZm9yIGRldGFpbHMgb24gc3VwcG9ydGVkXG4gKiBzeW50YXguXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBleHBhbmRHbG9iIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvZXhwYW5kX2dsb2IudHNcIjtcbiAqIGZvciBhd2FpdCAoY29uc3QgZmlsZSBvZiBleHBhbmRHbG9iKFwiKipcXC8qLnRzXCIpKSB7XG4gKiAgIGNvbnNvbGUubG9nKGZpbGUpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiogZXhwYW5kR2xvYihcbiAgZ2xvYjogc3RyaW5nIHwgVVJMLFxuICB7XG4gICAgcm9vdCxcbiAgICBleGNsdWRlID0gW10sXG4gICAgaW5jbHVkZURpcnMgPSB0cnVlLFxuICAgIGV4dGVuZGVkID0gdHJ1ZSxcbiAgICBnbG9ic3RhciA9IHRydWUsXG4gICAgY2FzZUluc2Vuc2l0aXZlLFxuICAgIGZvbGxvd1N5bWxpbmtzLFxuICAgIGNhbm9uaWNhbGl6ZSxcbiAgfTogRXhwYW5kR2xvYk9wdGlvbnMgPSB7fSxcbik6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgY29uc3Qge1xuICAgIHNlZ21lbnRzLFxuICAgIGlzQWJzb2x1dGU6IGlzR2xvYkFic29sdXRlLFxuICAgIGhhc1RyYWlsaW5nU2VwLFxuICAgIHdpblJvb3QsXG4gIH0gPSBzcGxpdCh0b1BhdGhTdHJpbmcoZ2xvYikpO1xuICByb290ID8/PSBpc0dsb2JBYnNvbHV0ZSA/IHdpblJvb3QgPz8gXCIvXCIgOiBEZW5vLmN3ZCgpO1xuXG4gIGNvbnN0IGdsb2JPcHRpb25zOiBHbG9iT3B0aW9ucyA9IHsgZXh0ZW5kZWQsIGdsb2JzdGFyLCBjYXNlSW5zZW5zaXRpdmUgfTtcbiAgY29uc3QgYWJzUm9vdCA9IGlzR2xvYkFic29sdXRlID8gcm9vdCA6IHJlc29sdmUocm9vdCEpOyAvLyByb290IGlzIGFsd2F5cyBzdHJpbmcgaGVyZVxuICBjb25zdCByZXNvbHZlRnJvbVJvb3QgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHJlc29sdmUoYWJzUm9vdCwgcGF0aCk7XG4gIGNvbnN0IGV4Y2x1ZGVQYXR0ZXJucyA9IGV4Y2x1ZGVcbiAgICAubWFwKHJlc29sdmVGcm9tUm9vdClcbiAgICAubWFwKChzOiBzdHJpbmcpOiBSZWdFeHAgPT4gZ2xvYlRvUmVnRXhwKHMsIGdsb2JPcHRpb25zKSk7XG4gIGNvbnN0IHNob3VsZEluY2x1ZGUgPSAocGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PlxuICAgICFleGNsdWRlUGF0dGVybnMuc29tZSgocDogUmVnRXhwKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocCkpO1xuXG4gIGxldCBmaXhlZFJvb3QgPSBpc0dsb2JBYnNvbHV0ZVxuICAgID8gd2luUm9vdCAhPT0gdW5kZWZpbmVkID8gd2luUm9vdCA6IFwiL1wiXG4gICAgOiBhYnNSb290O1xuICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoID4gMCAmJiAhaXNHbG9iKHNlZ21lbnRzWzBdISkpIHtcbiAgICBjb25zdCBzZWcgPSBzZWdtZW50cy5zaGlmdCgpO1xuICAgIGFzc2VydChzZWcgIT09IHVuZGVmaW5lZCk7XG4gICAgZml4ZWRSb290ID0gam9pbkdsb2JzKFtmaXhlZFJvb3QsIHNlZ10sIGdsb2JPcHRpb25zKTtcbiAgfVxuXG4gIGxldCBmaXhlZFJvb3RJbmZvOiBXYWxrRW50cnk7XG4gIHRyeSB7XG4gICAgZml4ZWRSb290SW5mbyA9IGF3YWl0IGNyZWF0ZVdhbGtFbnRyeShmaXhlZFJvb3QpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0aHJvd1VubGVzc05vdEZvdW5kKGVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uKiBhZHZhbmNlTWF0Y2goXG4gICAgd2Fsa0luZm86IFdhbGtFbnRyeSxcbiAgICBnbG9iU2VnbWVudDogc3RyaW5nLFxuICApOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gICAgaWYgKCF3YWxrSW5mby5pc0RpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZ2xvYlNlZ21lbnQgPT09IFwiLi5cIikge1xuICAgICAgY29uc3QgcGFyZW50UGF0aCA9IGpvaW5HbG9icyhbd2Fsa0luZm8ucGF0aCwgXCIuLlwiXSwgZ2xvYk9wdGlvbnMpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHNob3VsZEluY2x1ZGUocGFyZW50UGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4geWllbGQgYXdhaXQgY3JlYXRlV2Fsa0VudHJ5KHBhcmVudFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvd1VubGVzc05vdEZvdW5kKGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGdsb2JTZWdtZW50ID09PSBcIioqXCIpIHtcbiAgICAgIHJldHVybiB5aWVsZCogd2Fsayh3YWxrSW5mby5wYXRoLCB7XG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgbWF4RGVwdGg6IGdsb2JzdGFyID8gSW5maW5pdHkgOiAxLFxuICAgICAgICBmb2xsb3dTeW1saW5rcyxcbiAgICAgICAgY2Fub25pY2FsaXplLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGdsb2JQYXR0ZXJuID0gZ2xvYlRvUmVnRXhwKGdsb2JTZWdtZW50LCBnbG9iT3B0aW9ucyk7XG4gICAgZm9yIGF3YWl0IChcbiAgICAgIGNvbnN0IHdhbGtFbnRyeSBvZiB3YWxrKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgbWF4RGVwdGg6IDEsXG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICB9KVxuICAgICkge1xuICAgICAgaWYgKFxuICAgICAgICB3YWxrRW50cnkucGF0aCAhPT0gd2Fsa0luZm8ucGF0aCAmJlxuICAgICAgICB3YWxrRW50cnkubmFtZS5tYXRjaChnbG9iUGF0dGVybilcbiAgICAgICkge1xuICAgICAgICB5aWVsZCB3YWxrRW50cnk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IGN1cnJlbnRNYXRjaGVzOiBXYWxrRW50cnlbXSA9IFtmaXhlZFJvb3RJbmZvXTtcbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgLy8gQWR2YW5jaW5nIHRoZSBsaXN0IG9mIGN1cnJlbnQgbWF0Y2hlcyBtYXkgaW50cm9kdWNlIGR1cGxpY2F0ZXMsIHNvIHdlXG4gICAgLy8gcGFzcyBldmVyeXRoaW5nIHRocm91Z2ggdGhpcyBNYXAuXG4gICAgY29uc3QgbmV4dE1hdGNoTWFwOiBNYXA8c3RyaW5nLCBXYWxrRW50cnk+ID0gbmV3IE1hcCgpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgY3VycmVudE1hdGNoZXMubWFwKGFzeW5jIChjdXJyZW50TWF0Y2gpID0+IHtcbiAgICAgICAgZm9yIGF3YWl0IChjb25zdCBuZXh0TWF0Y2ggb2YgYWR2YW5jZU1hdGNoKGN1cnJlbnRNYXRjaCwgc2VnbWVudCkpIHtcbiAgICAgICAgICBuZXh0TWF0Y2hNYXAuc2V0KG5leHRNYXRjaC5wYXRoLCBuZXh0TWF0Y2gpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIGN1cnJlbnRNYXRjaGVzID0gWy4uLm5leHRNYXRjaE1hcC52YWx1ZXMoKV0uc29ydChjb21wYXJlUGF0aCk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTZXApIHtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IGN1cnJlbnRNYXRjaGVzLmZpbHRlcihcbiAgICAgIChlbnRyeTogV2Fsa0VudHJ5KTogYm9vbGVhbiA9PiBlbnRyeS5pc0RpcmVjdG9yeSxcbiAgICApO1xuICB9XG4gIGlmICghaW5jbHVkZURpcnMpIHtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IGN1cnJlbnRNYXRjaGVzLmZpbHRlcihcbiAgICAgIChlbnRyeTogV2Fsa0VudHJ5KTogYm9vbGVhbiA9PiAhZW50cnkuaXNEaXJlY3RvcnksXG4gICAgKTtcbiAgfVxuICB5aWVsZCogY3VycmVudE1hdGNoZXM7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgdmVyc2lvbiBvZiBgZXhwYW5kR2xvYigpYC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4cGFuZEdsb2JTeW5jIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvZXhwYW5kX2dsb2IudHNcIjtcbiAqIGZvciAoY29uc3QgZmlsZSBvZiBleHBhbmRHbG9iU3luYyhcIioqXFwvKi50c1wiKSkge1xuICogICBjb25zb2xlLmxvZyhmaWxlKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24qIGV4cGFuZEdsb2JTeW5jKFxuICBnbG9iOiBzdHJpbmcgfCBVUkwsXG4gIHtcbiAgICByb290LFxuICAgIGV4Y2x1ZGUgPSBbXSxcbiAgICBpbmNsdWRlRGlycyA9IHRydWUsXG4gICAgZXh0ZW5kZWQgPSB0cnVlLFxuICAgIGdsb2JzdGFyID0gdHJ1ZSxcbiAgICBjYXNlSW5zZW5zaXRpdmUsXG4gICAgZm9sbG93U3ltbGlua3MsXG4gICAgY2Fub25pY2FsaXplLFxuICB9OiBFeHBhbmRHbG9iT3B0aW9ucyA9IHt9LFxuKTogSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgY29uc3Qge1xuICAgIHNlZ21lbnRzLFxuICAgIGlzQWJzb2x1dGU6IGlzR2xvYkFic29sdXRlLFxuICAgIGhhc1RyYWlsaW5nU2VwLFxuICAgIHdpblJvb3QsXG4gIH0gPSBzcGxpdCh0b1BhdGhTdHJpbmcoZ2xvYikpO1xuICByb290ID8/PSBpc0dsb2JBYnNvbHV0ZSA/IHdpblJvb3QgPz8gXCIvXCIgOiBEZW5vLmN3ZCgpO1xuXG4gIGNvbnN0IGdsb2JPcHRpb25zOiBHbG9iT3B0aW9ucyA9IHsgZXh0ZW5kZWQsIGdsb2JzdGFyLCBjYXNlSW5zZW5zaXRpdmUgfTtcbiAgY29uc3QgYWJzUm9vdCA9IGlzR2xvYkFic29sdXRlID8gcm9vdCA6IHJlc29sdmUocm9vdCEpOyAvLyByb290IGlzIGFsd2F5cyBzdHJpbmcgaGVyZVxuICBjb25zdCByZXNvbHZlRnJvbVJvb3QgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHJlc29sdmUoYWJzUm9vdCwgcGF0aCk7XG4gIGNvbnN0IGV4Y2x1ZGVQYXR0ZXJucyA9IGV4Y2x1ZGVcbiAgICAubWFwKHJlc29sdmVGcm9tUm9vdClcbiAgICAubWFwKChzOiBzdHJpbmcpOiBSZWdFeHAgPT4gZ2xvYlRvUmVnRXhwKHMsIGdsb2JPcHRpb25zKSk7XG4gIGNvbnN0IHNob3VsZEluY2x1ZGUgPSAocGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PlxuICAgICFleGNsdWRlUGF0dGVybnMuc29tZSgocDogUmVnRXhwKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocCkpO1xuXG4gIGxldCBmaXhlZFJvb3QgPSBpc0dsb2JBYnNvbHV0ZVxuICAgID8gd2luUm9vdCAhPT0gdW5kZWZpbmVkID8gd2luUm9vdCA6IFwiL1wiXG4gICAgOiBhYnNSb290O1xuICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoID4gMCAmJiAhaXNHbG9iKHNlZ21lbnRzWzBdISkpIHtcbiAgICBjb25zdCBzZWcgPSBzZWdtZW50cy5zaGlmdCgpO1xuICAgIGFzc2VydChzZWcgIT09IHVuZGVmaW5lZCk7XG4gICAgZml4ZWRSb290ID0gam9pbkdsb2JzKFtmaXhlZFJvb3QsIHNlZ10sIGdsb2JPcHRpb25zKTtcbiAgfVxuXG4gIGxldCBmaXhlZFJvb3RJbmZvOiBXYWxrRW50cnk7XG4gIHRyeSB7XG4gICAgZml4ZWRSb290SW5mbyA9IGNyZWF0ZVdhbGtFbnRyeVN5bmMoZml4ZWRSb290KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdGhyb3dVbmxlc3NOb3RGb3VuZChlcnJvcik7XG4gIH1cblxuICBmdW5jdGlvbiogYWR2YW5jZU1hdGNoKFxuICAgIHdhbGtJbmZvOiBXYWxrRW50cnksXG4gICAgZ2xvYlNlZ21lbnQ6IHN0cmluZyxcbiAgKTogSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgICBpZiAoIXdhbGtJbmZvLmlzRGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChnbG9iU2VnbWVudCA9PT0gXCIuLlwiKSB7XG4gICAgICBjb25zdCBwYXJlbnRQYXRoID0gam9pbkdsb2JzKFt3YWxrSW5mby5wYXRoLCBcIi4uXCJdLCBnbG9iT3B0aW9ucyk7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoc2hvdWxkSW5jbHVkZShwYXJlbnRQYXRoKSkge1xuICAgICAgICAgIHJldHVybiB5aWVsZCBjcmVhdGVXYWxrRW50cnlTeW5jKHBhcmVudFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvd1VubGVzc05vdEZvdW5kKGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGdsb2JTZWdtZW50ID09PSBcIioqXCIpIHtcbiAgICAgIHJldHVybiB5aWVsZCogd2Fsa1N5bmMod2Fsa0luZm8ucGF0aCwge1xuICAgICAgICBza2lwOiBleGNsdWRlUGF0dGVybnMsXG4gICAgICAgIG1heERlcHRoOiBnbG9ic3RhciA/IEluZmluaXR5IDogMSxcbiAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICAgIGNhbm9uaWNhbGl6ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBnbG9iUGF0dGVybiA9IGdsb2JUb1JlZ0V4cChnbG9iU2VnbWVudCwgZ2xvYk9wdGlvbnMpO1xuICAgIGZvciAoXG4gICAgICBjb25zdCB3YWxrRW50cnkgb2Ygd2Fsa1N5bmMod2Fsa0luZm8ucGF0aCwge1xuICAgICAgICBtYXhEZXB0aDogMSxcbiAgICAgICAgc2tpcDogZXhjbHVkZVBhdHRlcm5zLFxuICAgICAgICBmb2xsb3dTeW1saW5rcyxcbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHdhbGtFbnRyeS5wYXRoICE9PSB3YWxrSW5mby5wYXRoICYmXG4gICAgICAgIHdhbGtFbnRyeS5uYW1lLm1hdGNoKGdsb2JQYXR0ZXJuKVxuICAgICAgKSB7XG4gICAgICAgIHlpZWxkIHdhbGtFbnRyeTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgY3VycmVudE1hdGNoZXM6IFdhbGtFbnRyeVtdID0gW2ZpeGVkUm9vdEluZm9dO1xuICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICAvLyBBZHZhbmNpbmcgdGhlIGxpc3Qgb2YgY3VycmVudCBtYXRjaGVzIG1heSBpbnRyb2R1Y2UgZHVwbGljYXRlcywgc28gd2VcbiAgICAvLyBwYXNzIGV2ZXJ5dGhpbmcgdGhyb3VnaCB0aGlzIE1hcC5cbiAgICBjb25zdCBuZXh0TWF0Y2hNYXA6IE1hcDxzdHJpbmcsIFdhbGtFbnRyeT4gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBjdXJyZW50TWF0Y2ggb2YgY3VycmVudE1hdGNoZXMpIHtcbiAgICAgIGZvciAoY29uc3QgbmV4dE1hdGNoIG9mIGFkdmFuY2VNYXRjaChjdXJyZW50TWF0Y2gsIHNlZ21lbnQpKSB7XG4gICAgICAgIG5leHRNYXRjaE1hcC5zZXQobmV4dE1hdGNoLnBhdGgsIG5leHRNYXRjaCk7XG4gICAgICB9XG4gICAgfVxuICAgIGN1cnJlbnRNYXRjaGVzID0gWy4uLm5leHRNYXRjaE1hcC52YWx1ZXMoKV0uc29ydChjb21wYXJlUGF0aCk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTZXApIHtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IGN1cnJlbnRNYXRjaGVzLmZpbHRlcihcbiAgICAgIChlbnRyeTogV2Fsa0VudHJ5KTogYm9vbGVhbiA9PiBlbnRyeS5pc0RpcmVjdG9yeSxcbiAgICApO1xuICB9XG4gIGlmICghaW5jbHVkZURpcnMpIHtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IGN1cnJlbnRNYXRjaGVzLmZpbHRlcihcbiAgICAgIChlbnRyeTogV2Fsa0VudHJ5KTogYm9vbGVhbiA9PiAhZW50cnkuaXNEaXJlY3RvcnksXG4gICAgKTtcbiAgfVxuICB5aWVsZCogY3VycmVudE1hdGNoZXM7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQTJCLFlBQVksUUFBUSw0QkFBNEI7QUFDM0UsU0FBUyxTQUFTLFFBQVEsd0JBQXdCO0FBQ2xELFNBQVMsTUFBTSxRQUFRLHFCQUFxQjtBQUM1QyxTQUFTLFVBQVUsUUFBUSx5QkFBeUI7QUFDcEQsU0FBUyxPQUFPLFFBQVEscUJBQXFCO0FBQzdDLFNBQVMsaUJBQWlCLFFBQVEsdUJBQXVCO0FBQ3pELFNBQVMsSUFBSSxFQUFFLFFBQVEsUUFBUSxZQUFZO0FBQzNDLFNBQVMsTUFBTSxRQUFRLHNCQUFzQjtBQUM3QyxTQUFTLFlBQVksUUFBUSx1QkFBdUI7QUFDcEQsU0FDRSxlQUFlLEVBQ2YsbUJBQW1CLFFBRWQsMEJBQTBCO0FBSWpDLE1BQU0sWUFBWSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFxQ3BDLFNBQVMsTUFBTSxJQUFZO0VBQ3pCLE1BQU0sSUFBSSxrQkFBa0IsTUFBTTtFQUNsQyxNQUFNLFdBQVcsS0FDZCxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxJQUN4QyxLQUFLLENBQUM7RUFDVCxNQUFNLGNBQWMsV0FBVztFQUMvQixPQUFPO0lBQ0w7SUFDQSxZQUFZO0lBQ1osZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMvQyxTQUFTLGFBQWEsY0FBYyxTQUFTLEtBQUssS0FBSztFQUN6RDtBQUNGO0FBRUEsU0FBUyxvQkFBb0IsS0FBYztFQUN6QyxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsUUFBUSxHQUFHO0lBQzVDLE1BQU07RUFDUjtBQUNGO0FB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
// denoCacheMetadata=10913611980635358684,12910895720445821016
