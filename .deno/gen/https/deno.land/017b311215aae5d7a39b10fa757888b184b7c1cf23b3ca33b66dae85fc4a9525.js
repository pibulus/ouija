// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { ANY } from "./constants.ts";
function formatNumber(value) {
  if (value === Number.POSITIVE_INFINITY) {
    return "∞";
  } else if (value === Number.NEGATIVE_INFINITY) {
    return "⧞";
  } else {
    return value.toFixed(0);
  }
}
/**
 * Format a SemVer object into a string.
 *
 * If any number is NaN then NaN will be printed.
 *
 * If any number is positive or negative infinity then '∞' or '⧞' will be printed instead.
 *
 * @param semver The semantic version to format
 * @returns The string representation of a semantic version.
 */ export function format(semver) {
  if (semver === ANY) {
    return "*";
  }
  const major = formatNumber(semver.major);
  const minor = formatNumber(semver.minor);
  const patch = formatNumber(semver.patch);
  const pre = semver.prerelease?.join(".") ?? "";
  const build = semver.build?.join(".") ?? "";
  const primary = `${major}.${minor}.${patch}`;
  const release = [
    primary,
    pre,
  ].filter((v) => v).join("-");
  return [
    release,
    build,
  ].filter((v) => v).join("+");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9mb3JtYXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IEFOWSB9IGZyb20gXCIuL2NvbnN0YW50cy50c1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG5mdW5jdGlvbiBmb3JtYXROdW1iZXIodmFsdWU6IG51bWJlcikge1xuICBpZiAodmFsdWUgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgIHJldHVybiBcIuKInlwiO1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpIHtcbiAgICByZXR1cm4gXCLip55cIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsdWUudG9GaXhlZCgwKTtcbiAgfVxufVxuXG4vKipcbiAqIEZvcm1hdCBhIFNlbVZlciBvYmplY3QgaW50byBhIHN0cmluZy5cbiAqXG4gKiBJZiBhbnkgbnVtYmVyIGlzIE5hTiB0aGVuIE5hTiB3aWxsIGJlIHByaW50ZWQuXG4gKlxuICogSWYgYW55IG51bWJlciBpcyBwb3NpdGl2ZSBvciBuZWdhdGl2ZSBpbmZpbml0eSB0aGVuICfiiJ4nIG9yICfip54nIHdpbGwgYmUgcHJpbnRlZCBpbnN0ZWFkLlxuICpcbiAqIEBwYXJhbSBzZW12ZXIgVGhlIHNlbWFudGljIHZlcnNpb24gdG8gZm9ybWF0XG4gKiBAcmV0dXJucyBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgc2VtYW50aWMgdmVyc2lvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdChzZW12ZXI6IFNlbVZlcik6IHN0cmluZyB7XG4gIGlmIChzZW12ZXIgPT09IEFOWSkge1xuICAgIHJldHVybiBcIipcIjtcbiAgfVxuXG4gIGNvbnN0IG1ham9yID0gZm9ybWF0TnVtYmVyKHNlbXZlci5tYWpvcik7XG4gIGNvbnN0IG1pbm9yID0gZm9ybWF0TnVtYmVyKHNlbXZlci5taW5vcik7XG4gIGNvbnN0IHBhdGNoID0gZm9ybWF0TnVtYmVyKHNlbXZlci5wYXRjaCk7XG4gIGNvbnN0IHByZSA9IHNlbXZlci5wcmVyZWxlYXNlPy5qb2luKFwiLlwiKSA/PyBcIlwiO1xuICBjb25zdCBidWlsZCA9IHNlbXZlci5idWlsZD8uam9pbihcIi5cIikgPz8gXCJcIjtcblxuICBjb25zdCBwcmltYXJ5ID0gYCR7bWFqb3J9LiR7bWlub3J9LiR7cGF0Y2h9YDtcbiAgY29uc3QgcmVsZWFzZSA9IFtwcmltYXJ5LCBwcmVdLmZpbHRlcigodikgPT4gdikuam9pbihcIi1cIik7XG4gIHJldHVybiBbcmVsZWFzZSwgYnVpbGRdLmZpbHRlcigodikgPT4gdikuam9pbihcIitcIik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsR0FBRyxRQUFRLGlCQUFpQjtBQUdyQyxTQUFTLGFBQWEsS0FBYTtFQUNqQyxJQUFJLFVBQVUsT0FBTyxpQkFBaUIsRUFBRTtJQUN0QyxPQUFPO0VBQ1QsT0FBTyxJQUFJLFVBQVUsT0FBTyxpQkFBaUIsRUFBRTtJQUM3QyxPQUFPO0VBQ1QsT0FBTztJQUNMLE9BQU8sTUFBTSxPQUFPLENBQUM7RUFDdkI7QUFDRjtBQUVBOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sU0FBUyxPQUFPLE1BQWM7RUFDbkMsSUFBSSxXQUFXLEtBQUs7SUFDbEIsT0FBTztFQUNUO0VBRUEsTUFBTSxRQUFRLGFBQWEsT0FBTyxLQUFLO0VBQ3ZDLE1BQU0sUUFBUSxhQUFhLE9BQU8sS0FBSztFQUN2QyxNQUFNLFFBQVEsYUFBYSxPQUFPLEtBQUs7RUFDdkMsTUFBTSxNQUFNLE9BQU8sVUFBVSxFQUFFLEtBQUssUUFBUTtFQUM1QyxNQUFNLFFBQVEsT0FBTyxLQUFLLEVBQUUsS0FBSyxRQUFRO0VBRXpDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE9BQU87RUFDNUMsTUFBTSxVQUFVO0lBQUM7SUFBUztHQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBTSxHQUFHLElBQUksQ0FBQztFQUNyRCxPQUFPO0lBQUM7SUFBUztHQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBTSxHQUFHLElBQUksQ0FBQztBQUNoRCJ9
// denoCacheMetadata=3034527492059761381,17876960726506773377
