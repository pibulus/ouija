// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { comparatorIntersects } from "./_comparator_intersects.ts";
function rangesSatisfiable(ranges) {
  return ranges.every((r) => {
    // For each OR at least one AND must be satisfiable
    return r.some((comparators) => comparatorsSatisfiable(comparators));
  });
}
function comparatorsSatisfiable(comparators) {
  // Comparators are satisfiable if they all intersect with each other
  for (let i = 0; i < comparators.length - 1; i++) {
    const c0 = comparators[i];
    for (const c1 of comparators.slice(i + 1)) {
      if (!comparatorIntersects(c0, c1)) {
        return false;
      }
    }
  }
  return true;
}
/**
 * The ranges intersect every range of AND comparators intersects with a least one range of OR ranges.
 * @param r0 range 0
 * @param r1 range 1
 * @returns returns true if any
 */ export function rangeIntersects(r0, r1) {
  return rangesSatisfiable([
    r0,
    r1,
  ]) && r0.some((r00) => {
    return r1.some((r11) => {
      return r00.every((c0) => {
        return r11.every((c1) => comparatorIntersects(c0, c1));
      });
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9yYW5nZV9pbnRlcnNlY3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBjb21wYXJhdG9ySW50ZXJzZWN0cyB9IGZyb20gXCIuL19jb21wYXJhdG9yX2ludGVyc2VjdHMudHNcIjtcbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgUmFuZ2UgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG5mdW5jdGlvbiByYW5nZXNTYXRpc2ZpYWJsZShyYW5nZXM6IFJhbmdlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIHJhbmdlcy5ldmVyeSgocikgPT4ge1xuICAgIC8vIEZvciBlYWNoIE9SIGF0IGxlYXN0IG9uZSBBTkQgbXVzdCBiZSBzYXRpc2ZpYWJsZVxuICAgIHJldHVybiByLnNvbWUoKGNvbXBhcmF0b3JzKSA9PiBjb21wYXJhdG9yc1NhdGlzZmlhYmxlKGNvbXBhcmF0b3JzKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjb21wYXJhdG9yc1NhdGlzZmlhYmxlKGNvbXBhcmF0b3JzOiBDb21wYXJhdG9yW10pOiBib29sZWFuIHtcbiAgLy8gQ29tcGFyYXRvcnMgYXJlIHNhdGlzZmlhYmxlIGlmIHRoZXkgYWxsIGludGVyc2VjdCB3aXRoIGVhY2ggb3RoZXJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wYXJhdG9ycy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjb25zdCBjMCA9IGNvbXBhcmF0b3JzW2ldO1xuICAgIGZvciAoY29uc3QgYzEgb2YgY29tcGFyYXRvcnMuc2xpY2UoaSArIDEpKSB7XG4gICAgICBpZiAoIWNvbXBhcmF0b3JJbnRlcnNlY3RzKGMwLCBjMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUaGUgcmFuZ2VzIGludGVyc2VjdCBldmVyeSByYW5nZSBvZiBBTkQgY29tcGFyYXRvcnMgaW50ZXJzZWN0cyB3aXRoIGEgbGVhc3Qgb25lIHJhbmdlIG9mIE9SIHJhbmdlcy5cbiAqIEBwYXJhbSByMCByYW5nZSAwXG4gKiBAcGFyYW0gcjEgcmFuZ2UgMVxuICogQHJldHVybnMgcmV0dXJucyB0cnVlIGlmIGFueVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2VJbnRlcnNlY3RzKFxuICByMDogUmFuZ2UsXG4gIHIxOiBSYW5nZSxcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gcmFuZ2VzU2F0aXNmaWFibGUoW3IwLCByMV0pICYmXG4gICAgcjAuc29tZSgocjAwKSA9PiB7XG4gICAgICByZXR1cm4gcjEuc29tZSgocjExKSA9PiB7XG4gICAgICAgIHJldHVybiByMDAuZXZlcnkoKGMwKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHIxMS5ldmVyeSgoYzEpID0+IGNvbXBhcmF0b3JJbnRlcnNlY3RzKGMwLCBjMSkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLG9CQUFvQixRQUFRLDhCQUE4QjtBQUduRSxTQUFTLGtCQUFrQixNQUFlO0VBQ3hDLE9BQU8sT0FBTyxLQUFLLENBQUMsQ0FBQztJQUNuQixtREFBbUQ7SUFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLGNBQWdCLHVCQUF1QjtFQUN4RDtBQUNGO0FBRUEsU0FBUyx1QkFBdUIsV0FBeUI7RUFDdkQsb0VBQW9FO0VBQ3BFLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxZQUFZLE1BQU0sR0FBRyxHQUFHLElBQUs7SUFDL0MsTUFBTSxLQUFLLFdBQVcsQ0FBQyxFQUFFO0lBQ3pCLEtBQUssTUFBTSxNQUFNLFlBQVksS0FBSyxDQUFDLElBQUksR0FBSTtNQUN6QyxJQUFJLENBQUMscUJBQXFCLElBQUksS0FBSztRQUNqQyxPQUFPO01BQ1Q7SUFDRjtFQUNGO0VBQ0EsT0FBTztBQUNUO0FBRUE7Ozs7O0NBS0MsR0FDRCxPQUFPLFNBQVMsZ0JBQ2QsRUFBUyxFQUNULEVBQVM7RUFFVCxPQUFPLGtCQUFrQjtJQUFDO0lBQUk7R0FBRyxLQUMvQixHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ1AsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO01BQ2QsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxLQUFPLHFCQUFxQixJQUFJO01BQ3BEO0lBQ0Y7RUFDRjtBQUNKIn0=
// denoCacheMetadata=7886699437230543277,17609130311453689020
