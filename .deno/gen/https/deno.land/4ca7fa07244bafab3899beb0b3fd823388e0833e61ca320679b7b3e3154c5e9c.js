// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { ANY, MAX, MIN } from "./constants.ts";
import { greaterThan } from "./greater_than.ts";
import { increment } from "./increment.ts";
/**
 * The minimum semantic version that could match this comparator
 * @param comparator The semantic version of the comparator
 * @param operator The operator of the comparator
 * @returns The minimum valid semantic version
 */ export function comparatorMin(comparator) {
  const semver = comparator.semver ?? comparator;
  if (semver === ANY) return MIN;
  switch (comparator.operator) {
    case ">":
      return semver.prerelease && semver.prerelease.length > 0
        ? increment(semver, "pre")
        : increment(semver, "patch");
    case "!=":
    case "!==":
    case "<=":
    case "<":
      // The min(<0.0.0) is MAX
      return greaterThan(semver, MIN) ? MIN : MAX;
    case ">=":
    case "":
    case "=":
    case "==":
    case "===":
      return {
        major: semver.major,
        minor: semver.minor,
        patch: semver.patch,
        prerelease: semver.prerelease,
        build: semver.build,
      };
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9fY29tcGFyYXRvcl9taW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB0eXBlIHsgQ29tcGFyYXRvciwgU2VtVmVyIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IEFOWSwgTUFYLCBNSU4gfSBmcm9tIFwiLi9jb25zdGFudHMudHNcIjtcbmltcG9ydCB7IGdyZWF0ZXJUaGFuIH0gZnJvbSBcIi4vZ3JlYXRlcl90aGFuLnRzXCI7XG5pbXBvcnQgeyBpbmNyZW1lbnQgfSBmcm9tIFwiLi9pbmNyZW1lbnQudHNcIjtcblxuLyoqXG4gKiBUaGUgbWluaW11bSBzZW1hbnRpYyB2ZXJzaW9uIHRoYXQgY291bGQgbWF0Y2ggdGhpcyBjb21wYXJhdG9yXG4gKiBAcGFyYW0gY29tcGFyYXRvciBUaGUgc2VtYW50aWMgdmVyc2lvbiBvZiB0aGUgY29tcGFyYXRvclxuICogQHBhcmFtIG9wZXJhdG9yIFRoZSBvcGVyYXRvciBvZiB0aGUgY29tcGFyYXRvclxuICogQHJldHVybnMgVGhlIG1pbmltdW0gdmFsaWQgc2VtYW50aWMgdmVyc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyYXRvck1pbihjb21wYXJhdG9yOiBDb21wYXJhdG9yKTogU2VtVmVyIHtcbiAgY29uc3Qgc2VtdmVyID0gY29tcGFyYXRvci5zZW12ZXIgPz8gY29tcGFyYXRvcjtcbiAgaWYgKHNlbXZlciA9PT0gQU5ZKSByZXR1cm4gTUlOO1xuICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICBjYXNlIFwiPlwiOlxuICAgICAgcmV0dXJuIHNlbXZlci5wcmVyZWxlYXNlICYmIHNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDBcbiAgICAgICAgPyBpbmNyZW1lbnQoc2VtdmVyLCBcInByZVwiKVxuICAgICAgICA6IGluY3JlbWVudChzZW12ZXIsIFwicGF0Y2hcIik7XG4gICAgY2FzZSBcIiE9XCI6XG4gICAgY2FzZSBcIiE9PVwiOlxuICAgIGNhc2UgXCI8PVwiOlxuICAgIGNhc2UgXCI8XCI6XG4gICAgICAvLyBUaGUgbWluKDwwLjAuMCkgaXMgTUFYXG4gICAgICByZXR1cm4gZ3JlYXRlclRoYW4oc2VtdmVyLCBNSU4pID8gTUlOIDogTUFYO1xuICAgIGNhc2UgXCI+PVwiOlxuICAgIGNhc2UgXCJcIjpcbiAgICBjYXNlIFwiPVwiOlxuICAgIGNhc2UgXCI9PVwiOlxuICAgIGNhc2UgXCI9PT1cIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yOiBzZW12ZXIubWFqb3IsXG4gICAgICAgIG1pbm9yOiBzZW12ZXIubWlub3IsXG4gICAgICAgIHBhdGNoOiBzZW12ZXIucGF0Y2gsXG4gICAgICAgIHByZXJlbGVhc2U6IHNlbXZlci5wcmVyZWxlYXNlLFxuICAgICAgICBidWlsZDogc2VtdmVyLmJ1aWxkLFxuICAgICAgfTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxRQUFRLGlCQUFpQjtBQUMvQyxTQUFTLFdBQVcsUUFBUSxvQkFBb0I7QUFDaEQsU0FBUyxTQUFTLFFBQVEsaUJBQWlCO0FBRTNDOzs7OztDQUtDLEdBQ0QsT0FBTyxTQUFTLGNBQWMsVUFBc0I7RUFDbEQsTUFBTSxTQUFTLFdBQVcsTUFBTSxJQUFJO0VBQ3BDLElBQUksV0FBVyxLQUFLLE9BQU87RUFDM0IsT0FBUSxXQUFXLFFBQVE7SUFDekIsS0FBSztNQUNILE9BQU8sT0FBTyxVQUFVLElBQUksT0FBTyxVQUFVLENBQUMsTUFBTSxHQUFHLElBQ25ELFVBQVUsUUFBUSxTQUNsQixVQUFVLFFBQVE7SUFDeEIsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztNQUNILHlCQUF5QjtNQUN6QixPQUFPLFlBQVksUUFBUSxPQUFPLE1BQU07SUFDMUMsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7TUFDSCxPQUFPO1FBQ0wsT0FBTyxPQUFPLEtBQUs7UUFDbkIsT0FBTyxPQUFPLEtBQUs7UUFDbkIsT0FBTyxPQUFPLEtBQUs7UUFDbkIsWUFBWSxPQUFPLFVBQVU7UUFDN0IsT0FBTyxPQUFPLEtBQUs7TUFDckI7RUFDSjtBQUNGIn0=
// denoCacheMetadata=15398497161458428651,16292418605026785574
