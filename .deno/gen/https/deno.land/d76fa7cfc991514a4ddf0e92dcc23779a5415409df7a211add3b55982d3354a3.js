// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { ANY, INVALID, MAX } from "./constants.ts";
/**
 * The maximum version that could match this comparator.
 *
 * If an invalid comparator is given such as <0.0.0 then
 * an out of range semver will be returned.
 * @returns the version, the MAX version or the next smallest patch version
 */ export function comparatorMax(comparator) {
  const semver = comparator.semver ?? comparator;
  if (semver === ANY) return MAX;
  switch (comparator.operator) {
    case "!=":
    case "!==":
    case ">":
    case ">=":
      return MAX;
    case "":
    case "=":
    case "==":
    case "===":
    case "<=":
      return {
        major: semver.major,
        minor: semver.minor,
        patch: semver.patch,
        prerelease: semver.prerelease,
        build: semver.build,
      };
    case "<": {
      const patch = semver.patch - 1;
      const minor = patch >= 0 ? semver.minor : semver.minor - 1;
      const major = minor >= 0 ? semver.major : semver.major - 1;
      // if you try to do <0.0.0 it will Give you -∞.∞.∞
      // which means no SemVer can compare successfully to it.
      if (major < 0) {
        return INVALID;
      } else {
        return {
          major,
          minor: minor >= 0 ? minor : Number.POSITIVE_INFINITY,
          patch: patch >= 0 ? patch : Number.POSITIVE_INFINITY,
          prerelease: [],
          build: [],
        };
      }
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9fY29tcGFyYXRvcl9tYXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IEFOWSwgSU5WQUxJRCwgTUFYIH0gZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5cbi8qKlxuICogVGhlIG1heGltdW0gdmVyc2lvbiB0aGF0IGNvdWxkIG1hdGNoIHRoaXMgY29tcGFyYXRvci5cbiAqXG4gKiBJZiBhbiBpbnZhbGlkIGNvbXBhcmF0b3IgaXMgZ2l2ZW4gc3VjaCBhcyA8MC4wLjAgdGhlblxuICogYW4gb3V0IG9mIHJhbmdlIHNlbXZlciB3aWxsIGJlIHJldHVybmVkLlxuICogQHJldHVybnMgdGhlIHZlcnNpb24sIHRoZSBNQVggdmVyc2lvbiBvciB0aGUgbmV4dCBzbWFsbGVzdCBwYXRjaCB2ZXJzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJhdG9yTWF4KGNvbXBhcmF0b3I6IENvbXBhcmF0b3IpOiBTZW1WZXIge1xuICBjb25zdCBzZW12ZXIgPSBjb21wYXJhdG9yLnNlbXZlciA/PyBjb21wYXJhdG9yO1xuICBpZiAoc2VtdmVyID09PSBBTlkpIHJldHVybiBNQVg7XG4gIHN3aXRjaCAoY29tcGFyYXRvci5vcGVyYXRvcikge1xuICAgIGNhc2UgXCIhPVwiOlxuICAgIGNhc2UgXCIhPT1cIjpcbiAgICBjYXNlIFwiPlwiOlxuICAgIGNhc2UgXCI+PVwiOlxuICAgICAgcmV0dXJuIE1BWDtcbiAgICBjYXNlIFwiXCI6XG4gICAgY2FzZSBcIj1cIjpcbiAgICBjYXNlIFwiPT1cIjpcbiAgICBjYXNlIFwiPT09XCI6XG4gICAgY2FzZSBcIjw9XCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogc2VtdmVyLm1ham9yLFxuICAgICAgICBtaW5vcjogc2VtdmVyLm1pbm9yLFxuICAgICAgICBwYXRjaDogc2VtdmVyLnBhdGNoLFxuICAgICAgICBwcmVyZWxlYXNlOiBzZW12ZXIucHJlcmVsZWFzZSxcbiAgICAgICAgYnVpbGQ6IHNlbXZlci5idWlsZCxcbiAgICAgIH07XG4gICAgY2FzZSBcIjxcIjoge1xuICAgICAgY29uc3QgcGF0Y2ggPSBzZW12ZXIucGF0Y2ggLSAxO1xuICAgICAgY29uc3QgbWlub3IgPSBwYXRjaCA+PSAwID8gc2VtdmVyLm1pbm9yIDogc2VtdmVyLm1pbm9yIC0gMTtcbiAgICAgIGNvbnN0IG1ham9yID0gbWlub3IgPj0gMCA/IHNlbXZlci5tYWpvciA6IHNlbXZlci5tYWpvciAtIDE7XG4gICAgICAvLyBpZiB5b3UgdHJ5IHRvIGRvIDwwLjAuMCBpdCB3aWxsIEdpdmUgeW91IC3iiJ4u4oieLuKInlxuICAgICAgLy8gd2hpY2ggbWVhbnMgbm8gU2VtVmVyIGNhbiBjb21wYXJlIHN1Y2Nlc3NmdWxseSB0byBpdC5cbiAgICAgIGlmIChtYWpvciA8IDApIHtcbiAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1ham9yLFxuICAgICAgICAgIG1pbm9yOiBtaW5vciA+PSAwID8gbWlub3IgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgICAgICAgcGF0Y2g6IHBhdGNoID49IDAgPyBwYXRjaCA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICAgICAgICBwcmVyZWxlYXNlOiBbXSxcbiAgICAgICAgICBidWlsZDogW10sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLFFBQVEsaUJBQWlCO0FBRW5EOzs7Ozs7Q0FNQyxHQUNELE9BQU8sU0FBUyxjQUFjLFVBQXNCO0VBQ2xELE1BQU0sU0FBUyxXQUFXLE1BQU0sSUFBSTtFQUNwQyxJQUFJLFdBQVcsS0FBSyxPQUFPO0VBQzNCLE9BQVEsV0FBVyxRQUFRO0lBQ3pCLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7TUFDSCxPQUFPO0lBQ1QsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7TUFDSCxPQUFPO1FBQ0wsT0FBTyxPQUFPLEtBQUs7UUFDbkIsT0FBTyxPQUFPLEtBQUs7UUFDbkIsT0FBTyxPQUFPLEtBQUs7UUFDbkIsWUFBWSxPQUFPLFVBQVU7UUFDN0IsT0FBTyxPQUFPLEtBQUs7TUFDckI7SUFDRixLQUFLO01BQUs7UUFDUixNQUFNLFFBQVEsT0FBTyxLQUFLLEdBQUc7UUFDN0IsTUFBTSxRQUFRLFNBQVMsSUFBSSxPQUFPLEtBQUssR0FBRyxPQUFPLEtBQUssR0FBRztRQUN6RCxNQUFNLFFBQVEsU0FBUyxJQUFJLE9BQU8sS0FBSyxHQUFHLE9BQU8sS0FBSyxHQUFHO1FBQ3pELGtEQUFrRDtRQUNsRCx3REFBd0Q7UUFDeEQsSUFBSSxRQUFRLEdBQUc7VUFDYixPQUFPO1FBQ1QsT0FBTztVQUNMLE9BQU87WUFDTDtZQUNBLE9BQU8sU0FBUyxJQUFJLFFBQVEsT0FBTyxpQkFBaUI7WUFDcEQsT0FBTyxTQUFTLElBQUksUUFBUSxPQUFPLGlCQUFpQjtZQUNwRCxZQUFZLEVBQUU7WUFDZCxPQUFPLEVBQUU7VUFDWDtRQUNGO01BQ0Y7RUFDRjtBQUNGIn0=
// denoCacheMetadata=4703573226261628487,3853380074854346281
