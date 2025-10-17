// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { greaterOrEqual } from "./greater_or_equal.ts";
import { lessOrEqual } from "./less_or_equal.ts";
import { comparatorMin } from "./_comparator_min.ts";
import { comparatorMax } from "./_comparator_max.ts";
/**
 * Returns true if the range of possible versions intersects with the other comparators set of possible versions
 * @param c0 The left side comparator
 * @param c1 The right side comparator
 * @returns True if any part of the comparators intersect
 */ export function comparatorIntersects(c0, c1) {
  const l0 = comparatorMin(c0);
  const l1 = comparatorMax(c0);
  const r0 = comparatorMin(c1);
  const r1 = comparatorMax(c1);
  // We calculate the min and max ranges of both comparators.
  // The minimum min is 0.0.0, the maximum max is ANY.
  //
  // Comparators with equality operators have the same min and max.
  //
  // We then check to see if the min's of either range falls within the span of the other range.
  //
  // A couple of intersection examples:
  // ```
  // l0 ---- l1
  //     r0 ---- r1
  // ```
  // ```
  //     l0 ---- l1
  // r0 ---- r1
  // ```
  // ```
  // l0 ------ l1
  //    r0--r1
  // ```
  // ```
  // l0 - l1
  // r0 - r1
  // ```
  //
  // non-intersection example
  // ```
  // l0 -- l1
  //          r0 -- r1
  // ```
  return greaterOrEqual(l0, r0) && lessOrEqual(l0, r1) ||
    greaterOrEqual(r0, l0) && lessOrEqual(r0, l1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9fY29tcGFyYXRvcl9pbnRlcnNlY3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgdHlwZSB7IENvbXBhcmF0b3IgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgZ3JlYXRlck9yRXF1YWwgfSBmcm9tIFwiLi9ncmVhdGVyX29yX2VxdWFsLnRzXCI7XG5pbXBvcnQgeyBsZXNzT3JFcXVhbCB9IGZyb20gXCIuL2xlc3Nfb3JfZXF1YWwudHNcIjtcbmltcG9ydCB7IGNvbXBhcmF0b3JNaW4gfSBmcm9tIFwiLi9fY29tcGFyYXRvcl9taW4udHNcIjtcbmltcG9ydCB7IGNvbXBhcmF0b3JNYXggfSBmcm9tIFwiLi9fY29tcGFyYXRvcl9tYXgudHNcIjtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSByYW5nZSBvZiBwb3NzaWJsZSB2ZXJzaW9ucyBpbnRlcnNlY3RzIHdpdGggdGhlIG90aGVyIGNvbXBhcmF0b3JzIHNldCBvZiBwb3NzaWJsZSB2ZXJzaW9uc1xuICogQHBhcmFtIGMwIFRoZSBsZWZ0IHNpZGUgY29tcGFyYXRvclxuICogQHBhcmFtIGMxIFRoZSByaWdodCBzaWRlIGNvbXBhcmF0b3JcbiAqIEByZXR1cm5zIFRydWUgaWYgYW55IHBhcnQgb2YgdGhlIGNvbXBhcmF0b3JzIGludGVyc2VjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyYXRvckludGVyc2VjdHMoXG4gIGMwOiBDb21wYXJhdG9yLFxuICBjMTogQ29tcGFyYXRvcixcbik6IGJvb2xlYW4ge1xuICBjb25zdCBsMCA9IGNvbXBhcmF0b3JNaW4oYzApO1xuICBjb25zdCBsMSA9IGNvbXBhcmF0b3JNYXgoYzApO1xuICBjb25zdCByMCA9IGNvbXBhcmF0b3JNaW4oYzEpO1xuICBjb25zdCByMSA9IGNvbXBhcmF0b3JNYXgoYzEpO1xuXG4gIC8vIFdlIGNhbGN1bGF0ZSB0aGUgbWluIGFuZCBtYXggcmFuZ2VzIG9mIGJvdGggY29tcGFyYXRvcnMuXG4gIC8vIFRoZSBtaW5pbXVtIG1pbiBpcyAwLjAuMCwgdGhlIG1heGltdW0gbWF4IGlzIEFOWS5cbiAgLy9cbiAgLy8gQ29tcGFyYXRvcnMgd2l0aCBlcXVhbGl0eSBvcGVyYXRvcnMgaGF2ZSB0aGUgc2FtZSBtaW4gYW5kIG1heC5cbiAgLy9cbiAgLy8gV2UgdGhlbiBjaGVjayB0byBzZWUgaWYgdGhlIG1pbidzIG9mIGVpdGhlciByYW5nZSBmYWxscyB3aXRoaW4gdGhlIHNwYW4gb2YgdGhlIG90aGVyIHJhbmdlLlxuICAvL1xuICAvLyBBIGNvdXBsZSBvZiBpbnRlcnNlY3Rpb24gZXhhbXBsZXM6XG4gIC8vIGBgYFxuICAvLyBsMCAtLS0tIGwxXG4gIC8vICAgICByMCAtLS0tIHIxXG4gIC8vIGBgYFxuICAvLyBgYGBcbiAgLy8gICAgIGwwIC0tLS0gbDFcbiAgLy8gcjAgLS0tLSByMVxuICAvLyBgYGBcbiAgLy8gYGBgXG4gIC8vIGwwIC0tLS0tLSBsMVxuICAvLyAgICByMC0tcjFcbiAgLy8gYGBgXG4gIC8vIGBgYFxuICAvLyBsMCAtIGwxXG4gIC8vIHIwIC0gcjFcbiAgLy8gYGBgXG4gIC8vXG4gIC8vIG5vbi1pbnRlcnNlY3Rpb24gZXhhbXBsZVxuICAvLyBgYGBcbiAgLy8gbDAgLS0gbDFcbiAgLy8gICAgICAgICAgcjAgLS0gcjFcbiAgLy8gYGBgXG4gIHJldHVybiAoZ3JlYXRlck9yRXF1YWwobDAsIHIwKSAmJiBsZXNzT3JFcXVhbChsMCwgcjEpKSB8fFxuICAgIChncmVhdGVyT3JFcXVhbChyMCwgbDApICYmIGxlc3NPckVxdWFsKHIwLCBsMSkpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUUxRSxTQUFTLGNBQWMsUUFBUSx3QkFBd0I7QUFDdkQsU0FBUyxXQUFXLFFBQVEscUJBQXFCO0FBQ2pELFNBQVMsYUFBYSxRQUFRLHVCQUF1QjtBQUNyRCxTQUFTLGFBQWEsUUFBUSx1QkFBdUI7QUFDckQ7Ozs7O0NBS0MsR0FDRCxPQUFPLFNBQVMscUJBQ2QsRUFBYyxFQUNkLEVBQWM7RUFFZCxNQUFNLEtBQUssY0FBYztFQUN6QixNQUFNLEtBQUssY0FBYztFQUN6QixNQUFNLEtBQUssY0FBYztFQUN6QixNQUFNLEtBQUssY0FBYztFQUV6QiwyREFBMkQ7RUFDM0Qsb0RBQW9EO0VBQ3BELEVBQUU7RUFDRixpRUFBaUU7RUFDakUsRUFBRTtFQUNGLDhGQUE4RjtFQUM5RixFQUFFO0VBQ0YscUNBQXFDO0VBQ3JDLE1BQU07RUFDTixhQUFhO0VBQ2IsaUJBQWlCO0VBQ2pCLE1BQU07RUFDTixNQUFNO0VBQ04saUJBQWlCO0VBQ2pCLGFBQWE7RUFDYixNQUFNO0VBQ04sTUFBTTtFQUNOLGVBQWU7RUFDZixZQUFZO0VBQ1osTUFBTTtFQUNOLE1BQU07RUFDTixVQUFVO0VBQ1YsVUFBVTtFQUNWLE1BQU07RUFDTixFQUFFO0VBQ0YsMkJBQTJCO0VBQzNCLE1BQU07RUFDTixXQUFXO0VBQ1gsb0JBQW9CO0VBQ3BCLE1BQU07RUFDTixPQUFPLEFBQUMsZUFBZSxJQUFJLE9BQU8sWUFBWSxJQUFJLE9BQy9DLGVBQWUsSUFBSSxPQUFPLFlBQVksSUFBSTtBQUMvQyJ9
// denoCacheMetadata=9236079803242040052,12815009732551436279
