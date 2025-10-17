// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
/**
 * MAX is a sentinel value used by some range calculations.
 * It is equivalent to `∞.∞.∞`.
 */ export const MAX = {
  major: Number.POSITIVE_INFINITY,
  minor: Number.POSITIVE_INFINITY,
  patch: Number.POSITIVE_INFINITY,
  prerelease: [],
  build: [],
};
/**
 * The minimum valid SemVer object. Equivalent to `0.0.0`.
 */ export const MIN = {
  major: 0,
  minor: 0,
  patch: 0,
  prerelease: [],
  build: [],
};
/**
 * A sentinel value used to denote an invalid SemVer object
 * which may be the result of impossible ranges or comparator operations.
 * @example
 * ```ts
 * import { equals } from "https://deno.land/std@$STD_VERSION/semver/equals.ts";
 * import { parse } from "https://deno.land/std@$STD_VERSION/semver/parse.ts";
 * import { INVALID } from "https://deno.land/std@$STD_VERSION/semver/constants.ts"
 * equals(parse("1.2.3"), INVALID);
 * ```
 */ export const INVALID = {
  major: Number.NEGATIVE_INFINITY,
  minor: Number.POSITIVE_INFINITY,
  patch: Number.POSITIVE_INFINITY,
  prerelease: [],
  build: [],
};
/**
 * ANY is a sentinel value used by some range calculations. It is not a valid
 * SemVer object and should not be used directly.
 * @example
 * ```ts
 * import { equals } from "https://deno.land/std@$STD_VERSION/semver/equals.ts";
 * import { parse } from "https://deno.land/std@$STD_VERSION/semver/parse.ts";
 * import { ANY } from "https://deno.land/std@$STD_VERSION/semver/constants.ts"
 * equals(parse("1.2.3"), ANY); // false
 * ```
 */ export const ANY = {
  major: Number.NaN,
  minor: Number.NaN,
  patch: Number.NaN,
  prerelease: [],
  build: [],
};
/**
 * A comparator which will span all valid semantic versions
 */ export const ALL = {
  operator: "",
  ...ANY,
  semver: ANY,
};
/**
 * A comparator which will not span any semantic versions
 */ export const NONE = {
  operator: "<",
  ...MIN,
  semver: MIN,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9jb25zdGFudHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuLyoqXG4gKiBNQVggaXMgYSBzZW50aW5lbCB2YWx1ZSB1c2VkIGJ5IHNvbWUgcmFuZ2UgY2FsY3VsYXRpb25zLlxuICogSXQgaXMgZXF1aXZhbGVudCB0byBg4oieLuKIni7iiJ5gLlxuICovXG5leHBvcnQgY29uc3QgTUFYOiBTZW1WZXIgPSB7XG4gIG1ham9yOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIG1pbm9yOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIHBhdGNoOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIHByZXJlbGVhc2U6IFtdLFxuICBidWlsZDogW10sXG59O1xuXG4vKipcbiAqIFRoZSBtaW5pbXVtIHZhbGlkIFNlbVZlciBvYmplY3QuIEVxdWl2YWxlbnQgdG8gYDAuMC4wYC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1JTjogU2VtVmVyID0ge1xuICBtYWpvcjogMCxcbiAgbWlub3I6IDAsXG4gIHBhdGNoOiAwLFxuICBwcmVyZWxlYXNlOiBbXSxcbiAgYnVpbGQ6IFtdLFxufTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHVzZWQgdG8gZGVub3RlIGFuIGludmFsaWQgU2VtVmVyIG9iamVjdFxuICogd2hpY2ggbWF5IGJlIHRoZSByZXN1bHQgb2YgaW1wb3NzaWJsZSByYW5nZXMgb3IgY29tcGFyYXRvciBvcGVyYXRpb25zLlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlcXVhbHMgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9zZW12ZXIvZXF1YWxzLnRzXCI7XG4gKiBpbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3NlbXZlci9wYXJzZS50c1wiO1xuICogaW1wb3J0IHsgSU5WQUxJRCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3NlbXZlci9jb25zdGFudHMudHNcIlxuICogZXF1YWxzKHBhcnNlKFwiMS4yLjNcIiksIElOVkFMSUQpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBJTlZBTElEOiBTZW1WZXIgPSB7XG4gIG1ham9yOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksXG4gIG1pbm9yOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIHBhdGNoOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIHByZXJlbGVhc2U6IFtdLFxuICBidWlsZDogW10sXG59O1xuXG4vKipcbiAqIEFOWSBpcyBhIHNlbnRpbmVsIHZhbHVlIHVzZWQgYnkgc29tZSByYW5nZSBjYWxjdWxhdGlvbnMuIEl0IGlzIG5vdCBhIHZhbGlkXG4gKiBTZW1WZXIgb2JqZWN0IGFuZCBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkuXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3NlbXZlci9lcXVhbHMudHNcIjtcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vc2VtdmVyL3BhcnNlLnRzXCI7XG4gKiBpbXBvcnQgeyBBTlkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9zZW12ZXIvY29uc3RhbnRzLnRzXCJcbiAqIGVxdWFscyhwYXJzZShcIjEuMi4zXCIpLCBBTlkpOyAvLyBmYWxzZVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBBTlk6IFNlbVZlciA9IHtcbiAgbWFqb3I6IE51bWJlci5OYU4sXG4gIG1pbm9yOiBOdW1iZXIuTmFOLFxuICBwYXRjaDogTnVtYmVyLk5hTixcbiAgcHJlcmVsZWFzZTogW10sXG4gIGJ1aWxkOiBbXSxcbn07XG5cbi8qKlxuICogQSBjb21wYXJhdG9yIHdoaWNoIHdpbGwgc3BhbiBhbGwgdmFsaWQgc2VtYW50aWMgdmVyc2lvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IEFMTDogQ29tcGFyYXRvciA9IHtcbiAgb3BlcmF0b3I6IFwiXCIsXG4gIC4uLkFOWSxcbiAgc2VtdmVyOiBBTlksXG59O1xuXG4vKipcbiAqIEEgY29tcGFyYXRvciB3aGljaCB3aWxsIG5vdCBzcGFuIGFueSBzZW1hbnRpYyB2ZXJzaW9uc1xuICovXG5leHBvcnQgY29uc3QgTk9ORTogQ29tcGFyYXRvciA9IHtcbiAgb3BlcmF0b3I6IFwiPFwiLFxuICAuLi5NSU4sXG4gIHNlbXZlcjogTUlOLFxufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFHMUU7OztDQUdDLEdBQ0QsT0FBTyxNQUFNLE1BQWM7RUFDekIsT0FBTyxPQUFPLGlCQUFpQjtFQUMvQixPQUFPLE9BQU8saUJBQWlCO0VBQy9CLE9BQU8sT0FBTyxpQkFBaUI7RUFDL0IsWUFBWSxFQUFFO0VBQ2QsT0FBTyxFQUFFO0FBQ1gsRUFBRTtBQUVGOztDQUVDLEdBQ0QsT0FBTyxNQUFNLE1BQWM7RUFDekIsT0FBTztFQUNQLE9BQU87RUFDUCxPQUFPO0VBQ1AsWUFBWSxFQUFFO0VBQ2QsT0FBTyxFQUFFO0FBQ1gsRUFBRTtBQUVGOzs7Ozs7Ozs7O0NBVUMsR0FDRCxPQUFPLE1BQU0sVUFBa0I7RUFDN0IsT0FBTyxPQUFPLGlCQUFpQjtFQUMvQixPQUFPLE9BQU8saUJBQWlCO0VBQy9CLE9BQU8sT0FBTyxpQkFBaUI7RUFDL0IsWUFBWSxFQUFFO0VBQ2QsT0FBTyxFQUFFO0FBQ1gsRUFBRTtBQUVGOzs7Ozs7Ozs7O0NBVUMsR0FDRCxPQUFPLE1BQU0sTUFBYztFQUN6QixPQUFPLE9BQU8sR0FBRztFQUNqQixPQUFPLE9BQU8sR0FBRztFQUNqQixPQUFPLE9BQU8sR0FBRztFQUNqQixZQUFZLEVBQUU7RUFDZCxPQUFPLEVBQUU7QUFDWCxFQUFFO0FBRUY7O0NBRUMsR0FDRCxPQUFPLE1BQU0sTUFBa0I7RUFDN0IsVUFBVTtFQUNWLEdBQUcsR0FBRztFQUNOLFFBQVE7QUFDVixFQUFFO0FBRUY7O0NBRUMsR0FDRCxPQUFPLE1BQU0sT0FBbUI7RUFDOUIsVUFBVTtFQUNWLEdBQUcsR0FBRztFQUNOLFFBQVE7QUFDVixFQUFFIn0=
// denoCacheMetadata=11930038355474495262,10530170016999419417
