// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { greaterOrEqual } from "./greater_or_equal.ts";
import { lessOrEqual } from "./less_or_equal.ts";
import { comparatorMin } from "./_comparator_min.ts";
import { comparatorMax } from "./_comparator_max.ts";
/**
 * Test to see if the version satisfies the range.
 * @param version The version to test
 * @param range The range to check
 * @returns true if the version is in the range
 */ export function testRange(version, range) {
  for (const r of range) {
    if (
      r.every((c) =>
        greaterOrEqual(version, comparatorMin(c)) &&
        lessOrEqual(version, comparatorMax(c))
      )
    ) {
      return true;
    }
  }
  return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci90ZXN0X3JhbmdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgdHlwZSB7IFJhbmdlLCBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuaW1wb3J0IHsgZ3JlYXRlck9yRXF1YWwgfSBmcm9tIFwiLi9ncmVhdGVyX29yX2VxdWFsLnRzXCI7XG5pbXBvcnQgeyBsZXNzT3JFcXVhbCB9IGZyb20gXCIuL2xlc3Nfb3JfZXF1YWwudHNcIjtcbmltcG9ydCB7IGNvbXBhcmF0b3JNaW4gfSBmcm9tIFwiLi9fY29tcGFyYXRvcl9taW4udHNcIjtcbmltcG9ydCB7IGNvbXBhcmF0b3JNYXggfSBmcm9tIFwiLi9fY29tcGFyYXRvcl9tYXgudHNcIjtcblxuLyoqXG4gKiBUZXN0IHRvIHNlZSBpZiB0aGUgdmVyc2lvbiBzYXRpc2ZpZXMgdGhlIHJhbmdlLlxuICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gdG8gdGVzdFxuICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSB0byBjaGVja1xuICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdmVyc2lvbiBpcyBpbiB0aGUgcmFuZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlc3RSYW5nZShcbiAgdmVyc2lvbjogU2VtVmVyLFxuICByYW5nZTogUmFuZ2UsXG4pOiBib29sZWFuIHtcbiAgZm9yIChjb25zdCByIG9mIHJhbmdlKSB7XG4gICAgaWYgKFxuICAgICAgci5ldmVyeSgoYykgPT5cbiAgICAgICAgZ3JlYXRlck9yRXF1YWwodmVyc2lvbiwgY29tcGFyYXRvck1pbihjKSkgJiZcbiAgICAgICAgbGVzc09yRXF1YWwodmVyc2lvbiwgY29tcGFyYXRvck1heChjKSlcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsY0FBYyxRQUFRLHdCQUF3QjtBQUN2RCxTQUFTLFdBQVcsUUFBUSxxQkFBcUI7QUFDakQsU0FBUyxhQUFhLFFBQVEsdUJBQXVCO0FBQ3JELFNBQVMsYUFBYSxRQUFRLHVCQUF1QjtBQUVyRDs7Ozs7Q0FLQyxHQUNELE9BQU8sU0FBUyxVQUNkLE9BQWUsRUFDZixLQUFZO0VBRVosS0FBSyxNQUFNLEtBQUssTUFBTztJQUNyQixJQUNFLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFDUCxlQUFlLFNBQVMsY0FBYyxPQUN0QyxZQUFZLFNBQVMsY0FBYyxNQUVyQztNQUNBLE9BQU87SUFDVDtFQUNGO0VBQ0EsT0FBTztBQUNUIn0=
// denoCacheMetadata=11763839982537827499,707548301983932822
