// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { globToRegExp, isGlob, joinGlobs } from "../path/glob.ts";
import { isAbsolute } from "../path/is_absolute.ts";
import { resolve } from "../path/resolve.ts";
import { SEP_PATTERN } from "../path/separator.ts";
import { walk, walkSync } from "./walk.ts";
import { assert } from "../assert/assert.ts";
import { createWalkEntry, createWalkEntrySync, toPathString } from "./_util.ts";
const isWindows = Deno.build.os === "windows";
function split(path) {
  const s = SEP_PATTERN.source;
  const segments = path.replace(new RegExp(`^${s}|${s}$`, "g"), "").split(
    SEP_PATTERN,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwOC4wL2ZzL2V4cGFuZF9nbG9iLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBHbG9iT3B0aW9ucywgZ2xvYlRvUmVnRXhwLCBpc0dsb2IsIGpvaW5HbG9icyB9IGZyb20gXCIuLi9wYXRoL2dsb2IudHNcIjtcbmltcG9ydCB7IGlzQWJzb2x1dGUgfSBmcm9tIFwiLi4vcGF0aC9pc19hYnNvbHV0ZS50c1wiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCIuLi9wYXRoL3Jlc29sdmUudHNcIjtcbmltcG9ydCB7IFNFUF9QQVRURVJOIH0gZnJvbSBcIi4uL3BhdGgvc2VwYXJhdG9yLnRzXCI7XG5pbXBvcnQgeyB3YWxrLCB3YWxrU3luYyB9IGZyb20gXCIuL3dhbGsudHNcIjtcbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuLi9hc3NlcnQvYXNzZXJ0LnRzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVXYWxrRW50cnksXG4gIGNyZWF0ZVdhbGtFbnRyeVN5bmMsXG4gIHRvUGF0aFN0cmluZyxcbiAgV2Fsa0VudHJ5LFxufSBmcm9tIFwiLi9fdXRpbC50c1wiO1xuXG5jb25zdCBpc1dpbmRvd3MgPSBEZW5vLmJ1aWxkLm9zID09PSBcIndpbmRvd3NcIjtcblxuZXhwb3J0IGludGVyZmFjZSBFeHBhbmRHbG9iT3B0aW9ucyBleHRlbmRzIE9taXQ8R2xvYk9wdGlvbnMsIFwib3NcIj4ge1xuICByb290Pzogc3RyaW5nO1xuICBleGNsdWRlPzogc3RyaW5nW107XG4gIGluY2x1ZGVEaXJzPzogYm9vbGVhbjtcbiAgZm9sbG93U3ltbGlua3M/OiBib29sZWFuO1xuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGZvbGxvd2VkIHN5bWxpbmsncyBwYXRoIHNob3VsZCBiZSBjYW5vbmljYWxpemVkLlxuICAgKiBUaGlzIG9wdGlvbiB3b3JrcyBvbmx5IGlmIGBmb2xsb3dTeW1saW5rc2AgaXMgbm90IGBmYWxzZWAuXG4gICAqIEBkZWZhdWx0IHt0cnVlfVxuICAgKi9cbiAgY2Fub25pY2FsaXplPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIFNwbGl0UGF0aCB7XG4gIHNlZ21lbnRzOiBzdHJpbmdbXTtcbiAgaXNBYnNvbHV0ZTogYm9vbGVhbjtcbiAgaGFzVHJhaWxpbmdTZXA6IGJvb2xlYW47XG4gIC8vIERlZmluZWQgZm9yIGFueSBhYnNvbHV0ZSBXaW5kb3dzIHBhdGguXG4gIHdpblJvb3Q/OiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIHNwbGl0KHBhdGg6IHN0cmluZyk6IFNwbGl0UGF0aCB7XG4gIGNvbnN0IHMgPSBTRVBfUEFUVEVSTi5zb3VyY2U7XG4gIGNvbnN0IHNlZ21lbnRzID0gcGF0aFxuICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke3N9fCR7c30kYCwgXCJnXCIpLCBcIlwiKVxuICAgIC5zcGxpdChTRVBfUEFUVEVSTik7XG4gIGNvbnN0IGlzQWJzb2x1dGVfID0gaXNBYnNvbHV0ZShwYXRoKTtcbiAgcmV0dXJuIHtcbiAgICBzZWdtZW50cyxcbiAgICBpc0Fic29sdXRlOiBpc0Fic29sdXRlXyxcbiAgICBoYXNUcmFpbGluZ1NlcDogISFwYXRoLm1hdGNoKG5ldyBSZWdFeHAoYCR7c30kYCkpLFxuICAgIHdpblJvb3Q6IGlzV2luZG93cyAmJiBpc0Fic29sdXRlXyA/IHNlZ21lbnRzLnNoaWZ0KCkgOiB1bmRlZmluZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRocm93VW5sZXNzTm90Rm91bmQoZXJyb3I6IHVua25vd24pIHtcbiAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkpIHtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb21wYXJlUGF0aChhOiBXYWxrRW50cnksIGI6IFdhbGtFbnRyeSk6IG51bWJlciB7XG4gIGlmIChhLnBhdGggPCBiLnBhdGgpIHJldHVybiAtMTtcbiAgaWYgKGEucGF0aCA+IGIucGF0aCkgcmV0dXJuIDE7XG4gIHJldHVybiAwO1xufVxuXG4vKipcbiAqIEV4cGFuZCB0aGUgZ2xvYiBzdHJpbmcgZnJvbSB0aGUgc3BlY2lmaWVkIGByb290YCBkaXJlY3RvcnkgYW5kIHlpZWxkIGVhY2hcbiAqIHJlc3VsdCBhcyBhIGBXYWxrRW50cnlgIG9iamVjdC5cbiAqXG4gKiBTZWUgW2BnbG9iVG9SZWdFeHAoKWBdKC4uL3BhdGgvZ2xvYi50cyNnbG9iVG9SZWdFeHApIGZvciBkZXRhaWxzIG9uIHN1cHBvcnRlZFxuICogc3ludGF4LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgZXhwYW5kR2xvYiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL2V4cGFuZF9nbG9iLnRzXCI7XG4gKiBmb3IgYXdhaXQgKGNvbnN0IGZpbGUgb2YgZXhwYW5kR2xvYihcIioqXFwvKi50c1wiKSkge1xuICogICBjb25zb2xlLmxvZyhmaWxlKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24qIGV4cGFuZEdsb2IoXG4gIGdsb2I6IHN0cmluZyB8IFVSTCxcbiAge1xuICAgIHJvb3QsXG4gICAgZXhjbHVkZSA9IFtdLFxuICAgIGluY2x1ZGVEaXJzID0gdHJ1ZSxcbiAgICBleHRlbmRlZCA9IHRydWUsXG4gICAgZ2xvYnN0YXIgPSB0cnVlLFxuICAgIGNhc2VJbnNlbnNpdGl2ZSxcbiAgICBmb2xsb3dTeW1saW5rcyxcbiAgICBjYW5vbmljYWxpemUsXG4gIH06IEV4cGFuZEdsb2JPcHRpb25zID0ge30sXG4pOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gIGNvbnN0IHtcbiAgICBzZWdtZW50cyxcbiAgICBpc0Fic29sdXRlOiBpc0dsb2JBYnNvbHV0ZSxcbiAgICBoYXNUcmFpbGluZ1NlcCxcbiAgICB3aW5Sb290LFxuICB9ID0gc3BsaXQodG9QYXRoU3RyaW5nKGdsb2IpKTtcbiAgcm9vdCA/Pz0gaXNHbG9iQWJzb2x1dGUgPyB3aW5Sb290ID8/IFwiL1wiIDogRGVuby5jd2QoKTtcblxuICBjb25zdCBnbG9iT3B0aW9uczogR2xvYk9wdGlvbnMgPSB7IGV4dGVuZGVkLCBnbG9ic3RhciwgY2FzZUluc2Vuc2l0aXZlIH07XG4gIGNvbnN0IGFic1Jvb3QgPSBpc0dsb2JBYnNvbHV0ZSA/IHJvb3QgOiByZXNvbHZlKHJvb3QhKTsgLy8gcm9vdCBpcyBhbHdheXMgc3RyaW5nIGhlcmVcbiAgY29uc3QgcmVzb2x2ZUZyb21Sb290ID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiByZXNvbHZlKGFic1Jvb3QsIHBhdGgpO1xuICBjb25zdCBleGNsdWRlUGF0dGVybnMgPSBleGNsdWRlXG4gICAgLm1hcChyZXNvbHZlRnJvbVJvb3QpXG4gICAgLm1hcCgoczogc3RyaW5nKTogUmVnRXhwID0+IGdsb2JUb1JlZ0V4cChzLCBnbG9iT3B0aW9ucykpO1xuICBjb25zdCBzaG91bGRJbmNsdWRlID0gKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgICAhZXhjbHVkZVBhdHRlcm5zLnNvbWUoKHA6IFJlZ0V4cCk6IGJvb2xlYW4gPT4gISFwYXRoLm1hdGNoKHApKTtcblxuICBsZXQgZml4ZWRSb290ID0gaXNHbG9iQWJzb2x1dGVcbiAgICA/IHdpblJvb3QgIT09IHVuZGVmaW5lZCA/IHdpblJvb3QgOiBcIi9cIlxuICAgIDogYWJzUm9vdDtcbiAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA+IDAgJiYgIWlzR2xvYihzZWdtZW50c1swXSkpIHtcbiAgICBjb25zdCBzZWcgPSBzZWdtZW50cy5zaGlmdCgpO1xuICAgIGFzc2VydChzZWcgIT09IHVuZGVmaW5lZCk7XG4gICAgZml4ZWRSb290ID0gam9pbkdsb2JzKFtmaXhlZFJvb3QsIHNlZ10sIGdsb2JPcHRpb25zKTtcbiAgfVxuXG4gIGxldCBmaXhlZFJvb3RJbmZvOiBXYWxrRW50cnk7XG4gIHRyeSB7XG4gICAgZml4ZWRSb290SW5mbyA9IGF3YWl0IGNyZWF0ZVdhbGtFbnRyeShmaXhlZFJvb3QpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0aHJvd1VubGVzc05vdEZvdW5kKGVycm9yKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uKiBhZHZhbmNlTWF0Y2goXG4gICAgd2Fsa0luZm86IFdhbGtFbnRyeSxcbiAgICBnbG9iU2VnbWVudDogc3RyaW5nLFxuICApOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8V2Fsa0VudHJ5PiB7XG4gICAgaWYgKCF3YWxrSW5mby5pc0RpcmVjdG9yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZ2xvYlNlZ21lbnQgPT09IFwiLi5cIikge1xuICAgICAgY29uc3QgcGFyZW50UGF0aCA9IGpvaW5HbG9icyhbd2Fsa0luZm8ucGF0aCwgXCIuLlwiXSwgZ2xvYk9wdGlvbnMpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHNob3VsZEluY2x1ZGUocGFyZW50UGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4geWllbGQgYXdhaXQgY3JlYXRlV2Fsa0VudHJ5KHBhcmVudFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aHJvd1VubGVzc05vdEZvdW5kKGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGdsb2JTZWdtZW50ID09PSBcIioqXCIpIHtcbiAgICAgIHJldHVybiB5aWVsZCogd2Fsayh3YWxrSW5mby5wYXRoLCB7XG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgbWF4RGVwdGg6IGdsb2JzdGFyID8gSW5maW5pdHkgOiAxLFxuICAgICAgICBmb2xsb3dTeW1saW5rcyxcbiAgICAgICAgY2Fub25pY2FsaXplLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGdsb2JQYXR0ZXJuID0gZ2xvYlRvUmVnRXhwKGdsb2JTZWdtZW50LCBnbG9iT3B0aW9ucyk7XG4gICAgZm9yIGF3YWl0IChcbiAgICAgIGNvbnN0IHdhbGtFbnRyeSBvZiB3YWxrKHdhbGtJbmZvLnBhdGgsIHtcbiAgICAgICAgbWF4RGVwdGg6IDEsXG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgZm9sbG93U3ltbGlua3MsXG4gICAgICB9KVxuICAgICkge1xuICAgICAgaWYgKFxuICAgICAgICB3YWxrRW50cnkucGF0aCAhPT0gd2Fsa0luZm8ucGF0aCAmJlxuICAgICAgICB3YWxrRW50cnkubmFtZS5tYXRjaChnbG9iUGF0dGVybilcbiAgICAgICkge1xuICAgICAgICB5aWVsZCB3YWxrRW50cnk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IGN1cnJlbnRNYXRjaGVzOiBXYWxrRW50cnlbXSA9IFtmaXhlZFJvb3RJbmZvXTtcbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7XG4gICAgLy8gQWR2YW5jaW5nIHRoZSBsaXN0IG9mIGN1cnJlbnQgbWF0Y2hlcyBtYXkgaW50cm9kdWNlIGR1cGxpY2F0ZXMsIHNvIHdlXG4gICAgLy8gcGFzcyBldmVyeXRoaW5nIHRocm91Z2ggdGhpcyBNYXAuXG4gICAgY29uc3QgbmV4dE1hdGNoTWFwOiBNYXA8c3RyaW5nLCBXYWxrRW50cnk+ID0gbmV3IE1hcCgpO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgY3VycmVudE1hdGNoZXMubWFwKGFzeW5jIChjdXJyZW50TWF0Y2gpID0+IHtcbiAgICAgICAgZm9yIGF3YWl0IChjb25zdCBuZXh0TWF0Y2ggb2YgYWR2YW5jZU1hdGNoKGN1cnJlbnRNYXRjaCwgc2VnbWVudCkpIHtcbiAgICAgICAgICBuZXh0TWF0Y2hNYXAuc2V0KG5leHRNYXRjaC5wYXRoLCBuZXh0TWF0Y2gpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIGN1cnJlbnRNYXRjaGVzID0gWy4uLm5leHRNYXRjaE1hcC52YWx1ZXMoKV0uc29ydChjb21wYXJlUGF0aCk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTZXApIHtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IGN1cnJlbnRNYXRjaGVzLmZpbHRlcihcbiAgICAgIChlbnRyeTogV2Fsa0VudHJ5KTogYm9vbGVhbiA9PiBlbnRyeS5pc0RpcmVjdG9yeSxcbiAgICApO1xuICB9XG4gIGlmICghaW5jbHVkZURpcnMpIHtcbiAgICBjdXJyZW50TWF0Y2hlcyA9IGN1cnJlbnRNYXRjaGVzLmZpbHRlcihcbiAgICAgIChlbnRyeTogV2Fsa0VudHJ5KTogYm9vbGVhbiA9PiAhZW50cnkuaXNEaXJlY3RvcnksXG4gICAgKTtcbiAgfVxuICB5aWVsZCogY3VycmVudE1hdGNoZXM7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgdmVyc2lvbiBvZiBgZXhwYW5kR2xvYigpYC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGV4cGFuZEdsb2JTeW5jIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvZXhwYW5kX2dsb2IudHNcIjtcbiAqIGZvciAoY29uc3QgZmlsZSBvZiBleHBhbmRHbG9iU3luYyhcIioqXFwvKi50c1wiKSkge1xuICogICBjb25zb2xlLmxvZyhmaWxlKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24qIGV4cGFuZEdsb2JTeW5jKFxuICBnbG9iOiBzdHJpbmcgfCBVUkwsXG4gIHtcbiAgICByb290LFxuICAgIGV4Y2x1ZGUgPSBbXSxcbiAgICBpbmNsdWRlRGlycyA9IHRydWUsXG4gICAgZXh0ZW5kZWQgPSB0cnVlLFxuICAgIGdsb2JzdGFyID0gdHJ1ZSxcbiAgICBjYXNlSW5zZW5zaXRpdmUsXG4gICAgZm9sbG93U3ltbGlua3MsXG4gICAgY2Fub25pY2FsaXplLFxuICB9OiBFeHBhbmRHbG9iT3B0aW9ucyA9IHt9LFxuKTogSXRlcmFibGVJdGVyYXRvcjxXYWxrRW50cnk+IHtcbiAgY29uc3Qge1xuICAgIHNlZ21lbnRzLFxuICAgIGlzQWJzb2x1dGU6IGlzR2xvYkFic29sdXRlLFxuICAgIGhhc1RyYWlsaW5nU2VwLFxuICAgIHdpblJvb3QsXG4gIH0gPSBzcGxpdCh0b1BhdGhTdHJpbmcoZ2xvYikpO1xuICByb290ID8/PSBpc0dsb2JBYnNvbHV0ZSA/IHdpblJvb3QgPz8gXCIvXCIgOiBEZW5vLmN3ZCgpO1xuXG4gIGNvbnN0IGdsb2JPcHRpb25zOiBHbG9iT3B0aW9ucyA9IHsgZXh0ZW5kZWQsIGdsb2JzdGFyLCBjYXNlSW5zZW5zaXRpdmUgfTtcbiAgY29uc3QgYWJzUm9vdCA9IGlzR2xvYkFic29sdXRlID8gcm9vdCA6IHJlc29sdmUocm9vdCEpOyAvLyByb290IGlzIGFsd2F5cyBzdHJpbmcgaGVyZVxuICBjb25zdCByZXNvbHZlRnJvbVJvb3QgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHJlc29sdmUoYWJzUm9vdCwgcGF0aCk7XG4gIGNvbnN0IGV4Y2x1ZGVQYXR0ZXJucyA9IGV4Y2x1ZGVcbiAgICAubWFwKHJlc29sdmVGcm9tUm9vdClcbiAgICAubWFwKChzOiBzdHJpbmcpOiBSZWdFeHAgPT4gZ2xvYlRvUmVnRXhwKHMsIGdsb2JPcHRpb25zKSk7XG4gIGNvbnN0IHNob3VsZEluY2x1ZGUgPSAocGF0aDogc3RyaW5nKTogYm9vbGVhbiA9PlxuICAgICFleGNsdWRlUGF0dGVybnMuc29tZSgocDogUmVnRXhwKTogYm9vbGVhbiA9PiAhIXBhdGgubWF0Y2gocCkpO1xuXG4gIGxldCBmaXhlZFJvb3QgPSBpc0dsb2JBYnNvbHV0ZVxuICAgID8gd2luUm9vdCAhPT0gdW5kZWZpbmVkID8gd2luUm9vdCA6IFwiL1wiXG4gICAgOiBhYnNSb290O1xuICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoID4gMCAmJiAhaXNHbG9iKHNlZ21lbnRzWzBdKSkge1xuICAgIGNvbnN0IHNlZyA9IHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgYXNzZXJ0KHNlZyAhPT0gdW5kZWZpbmVkKTtcbiAgICBmaXhlZFJvb3QgPSBqb2luR2xvYnMoW2ZpeGVkUm9vdCwgc2VnXSwgZ2xvYk9wdGlvbnMpO1xuICB9XG5cbiAgbGV0IGZpeGVkUm9vdEluZm86IFdhbGtFbnRyeTtcbiAgdHJ5IHtcbiAgICBmaXhlZFJvb3RJbmZvID0gY3JlYXRlV2Fsa0VudHJ5U3luYyhmaXhlZFJvb3QpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0aHJvd1VubGVzc05vdEZvdW5kKGVycm9yKTtcbiAgfVxuXG4gIGZ1bmN0aW9uKiBhZHZhbmNlTWF0Y2goXG4gICAgd2Fsa0luZm86IFdhbGtFbnRyeSxcbiAgICBnbG9iU2VnbWVudDogc3RyaW5nLFxuICApOiBJdGVyYWJsZUl0ZXJhdG9yPFdhbGtFbnRyeT4ge1xuICAgIGlmICghd2Fsa0luZm8uaXNEaXJlY3RvcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGdsb2JTZWdtZW50ID09PSBcIi4uXCIpIHtcbiAgICAgIGNvbnN0IHBhcmVudFBhdGggPSBqb2luR2xvYnMoW3dhbGtJbmZvLnBhdGgsIFwiLi5cIl0sIGdsb2JPcHRpb25zKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChzaG91bGRJbmNsdWRlKHBhcmVudFBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIHlpZWxkIGNyZWF0ZVdhbGtFbnRyeVN5bmMocGFyZW50UGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHRocm93VW5sZXNzTm90Rm91bmQoZXJyb3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZ2xvYlNlZ21lbnQgPT09IFwiKipcIikge1xuICAgICAgcmV0dXJuIHlpZWxkKiB3YWxrU3luYyh3YWxrSW5mby5wYXRoLCB7XG4gICAgICAgIHNraXA6IGV4Y2x1ZGVQYXR0ZXJucyxcbiAgICAgICAgbWF4RGVwdGg6IGdsb2JzdGFyID8gSW5maW5pdHkgOiAxLFxuICAgICAgICBmb2xsb3dTeW1saW5rcyxcbiAgICAgICAgY2Fub25pY2FsaXplLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGdsb2JQYXR0ZXJuID0gZ2xvYlRvUmVnRXhwKGdsb2JTZWdtZW50LCBnbG9iT3B0aW9ucyk7XG4gICAgZm9yIChcbiAgICAgIGNvbnN0IHdhbGtFbnRyeSBvZiB3YWxrU3luYyh3YWxrSW5mby5wYXRoLCB7XG4gICAgICAgIG1heERlcHRoOiAxLFxuICAgICAgICBza2lwOiBleGNsdWRlUGF0dGVybnMsXG4gICAgICAgIGZvbGxvd1N5bWxpbmtzLFxuICAgICAgfSlcbiAgICApIHtcbiAgICAgIGlmIChcbiAgICAgICAgd2Fsa0VudHJ5LnBhdGggIT09IHdhbGtJbmZvLnBhdGggJiZcbiAgICAgICAgd2Fsa0VudHJ5Lm5hbWUubWF0Y2goZ2xvYlBhdHRlcm4pXG4gICAgICApIHtcbiAgICAgICAgeWllbGQgd2Fsa0VudHJ5O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBjdXJyZW50TWF0Y2hlczogV2Fsa0VudHJ5W10gPSBbZml4ZWRSb290SW5mb107XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykge1xuICAgIC8vIEFkdmFuY2luZyB0aGUgbGlzdCBvZiBjdXJyZW50IG1hdGNoZXMgbWF5IGludHJvZHVjZSBkdXBsaWNhdGVzLCBzbyB3ZVxuICAgIC8vIHBhc3MgZXZlcnl0aGluZyB0aHJvdWdoIHRoaXMgTWFwLlxuICAgIGNvbnN0IG5leHRNYXRjaE1hcDogTWFwPHN0cmluZywgV2Fsa0VudHJ5PiA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGN1cnJlbnRNYXRjaCBvZiBjdXJyZW50TWF0Y2hlcykge1xuICAgICAgZm9yIChjb25zdCBuZXh0TWF0Y2ggb2YgYWR2YW5jZU1hdGNoKGN1cnJlbnRNYXRjaCwgc2VnbWVudCkpIHtcbiAgICAgICAgbmV4dE1hdGNoTWFwLnNldChuZXh0TWF0Y2gucGF0aCwgbmV4dE1hdGNoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY3VycmVudE1hdGNoZXMgPSBbLi4ubmV4dE1hdGNoTWFwLnZhbHVlcygpXS5zb3J0KGNvbXBhcmVQYXRoKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NlcCkge1xuICAgIGN1cnJlbnRNYXRjaGVzID0gY3VycmVudE1hdGNoZXMuZmlsdGVyKFxuICAgICAgKGVudHJ5OiBXYWxrRW50cnkpOiBib29sZWFuID0+IGVudHJ5LmlzRGlyZWN0b3J5LFxuICAgICk7XG4gIH1cbiAgaWYgKCFpbmNsdWRlRGlycykge1xuICAgIGN1cnJlbnRNYXRjaGVzID0gY3VycmVudE1hdGNoZXMuZmlsdGVyKFxuICAgICAgKGVudHJ5OiBXYWxrRW50cnkpOiBib29sZWFuID0+ICFlbnRyeS5pc0RpcmVjdG9yeSxcbiAgICApO1xuICB9XG4gIHlpZWxkKiBjdXJyZW50TWF0Y2hlcztcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBc0IsWUFBWSxFQUFFLE1BQU0sRUFBRSxTQUFTLFFBQVEsa0JBQWtCO0FBQy9FLFNBQVMsVUFBVSxRQUFRLHlCQUF5QjtBQUNwRCxTQUFTLE9BQU8sUUFBUSxxQkFBcUI7QUFDN0MsU0FBUyxXQUFXLFFBQVEsdUJBQXVCO0FBQ25ELFNBQVMsSUFBSSxFQUFFLFFBQVEsUUFBUSxZQUFZO0FBQzNDLFNBQVMsTUFBTSxRQUFRLHNCQUFzQjtBQUM3QyxTQUNFLGVBQWUsRUFDZixtQkFBbUIsRUFDbkIsWUFBWSxRQUVQLGFBQWE7QUFFcEIsTUFBTSxZQUFZLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSztBQXVCcEMsU0FBUyxNQUFNLElBQVk7RUFDekIsTUFBTSxJQUFJLFlBQVksTUFBTTtFQUM1QixNQUFNLFdBQVcsS0FDZCxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxJQUN4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
// denoCacheMetadata=5460532015022031845,1836408370920943896
