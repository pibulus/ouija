// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { parseBuild } from "./_shared.ts";
function bumpPrereleaseNumber(prerelease = []) {
  const values = [
    ...prerelease,
  ];
  let index = values.length;
  while (index >= 0) {
    const value = values[index];
    if (typeof value === "number") {
      values[index] = value + 1;
      break;
    }
    index -= 1;
  }
  // if no number was bumped
  if (index === -1) values.push(0);
  return values;
}
function bumpPrerelease(prerelease = [], identifier) {
  let values = bumpPrereleaseNumber(prerelease);
  if (!identifier) return values;
  // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
  // 1.2.0-beta.foobar or 1.2.0-beta bumps to 1.2.0-beta.0
  if (values[0] !== identifier || isNaN(values[1])) {
    values = [
      identifier,
      0,
    ];
  }
  return values;
}
/**
 * Returns the new version resulting from an increment by release type.
 *
 * `premajor`, `preminor` and `prepatch` will bump the version up to the next version,
 * based on the type, and will also add prerelease metadata.
 *
 * If called from a non-prerelease version, the `prerelease` will work the same as
 * `prepatch`. The patch version is incremented and then is made into a prerelease. If
 * the input version is already a prerelease it will simply increment the prerelease
 * metadata.
 *
 * If a prerelease identifier is specified without a number then a number will be added.
 * For example `pre` will result in `pre.0`. If the existing version already has a
 * prerelease with a number and its the same prerelease identifier then the number
 * will be incremented. If the identifier differs from the new identifier then the new
 * identifier is applied and the number is reset to `0`.
 *
 * If the input version has build metadata it will be preserved on the resulting version
 * unless a new build parameter is specified. Specifying `""` will unset existing build
 * metadata.
 * @param version The version to increment
 * @param release The type of increment to perform
 * @param prerelease The pre-release metadata of the new version
 * @param build The build metadata of the new version
 * @returns
 */ export function increment(version, release, prerelease, buildmetadata) {
  const build = buildmetadata !== undefined
    ? parseBuild(buildmetadata)
    : version.build;
  switch (release) {
    case "premajor":
      return {
        major: version.major + 1,
        minor: 0,
        patch: 0,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build,
      };
    case "preminor":
      return {
        major: version.major,
        minor: version.minor + 1,
        patch: 0,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build,
      };
    case "prepatch":
      return {
        major: version.major,
        minor: version.minor,
        patch: version.patch + 1,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build,
      };
    case "prerelease": {
      // If the input is a non-prerelease version, this acts the same as prepatch.
      const isPrerelease = (version.prerelease ?? []).length === 0;
      const patch = isPrerelease ? version.patch + 1 : version.patch;
      return {
        major: version.major,
        minor: version.minor,
        patch,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build,
      };
    }
    case "major": {
      // If this is a pre-major version, bump up to the same major version. Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      const isPrerelease = (version.prerelease ?? []).length === 0;
      const major = isPrerelease || version.minor !== 0 || version.patch !== 0
        ? version.major + 1
        : version.major;
      return {
        major,
        minor: 0,
        patch: 0,
        prerelease: [],
        build,
      };
    }
    case "minor": {
      // If this is a pre-minor version, bump up to the same minor version. Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      const isPrerelease = (version.prerelease ?? []).length === 0;
      const minor = isPrerelease || version.patch !== 0
        ? version.minor + 1
        : version.minor;
      return {
        major: version.major,
        minor,
        patch: 0,
        prerelease: [],
        build,
      };
    }
    case "patch": {
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      const isPrerelease = (version.prerelease ?? []).length === 0;
      const patch = isPrerelease ? version.patch + 1 : version.patch;
      return {
        major: version.major,
        minor: version.minor,
        patch,
        prerelease: [],
        build,
      };
    }
    case "pre": {
      // 1.0.0 "pre" would become 1.0.0-0
      // 1.0.0-0 would become 1.0.0-1
      // 1.0.0-beta.0 would be come 1.0.0-beta.1
      // switching the pre identifier resets the number to 0
      return {
        major: version.major,
        minor: version.minor,
        patch: version.patch,
        prerelease: bumpPrerelease(version.prerelease, prerelease),
        build,
      };
    }
    default:
      throw new Error(`invalid increment argument: ${release}`);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9pbmNyZW1lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IHBhcnNlQnVpbGQgfSBmcm9tIFwiLi9fc2hhcmVkLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFJlbGVhc2VUeXBlLCBTZW1WZXIgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG5mdW5jdGlvbiBidW1wUHJlcmVsZWFzZU51bWJlcihwcmVyZWxlYXNlOiBSZWFkb25seUFycmF5PHN0cmluZyB8IG51bWJlcj4gPSBbXSkge1xuICBjb25zdCB2YWx1ZXMgPSBbLi4ucHJlcmVsZWFzZV07XG5cbiAgbGV0IGluZGV4ID0gdmFsdWVzLmxlbmd0aDtcbiAgd2hpbGUgKGluZGV4ID49IDApIHtcbiAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpbmRleF07XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlICsgMTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpbmRleCAtPSAxO1xuICB9XG4gIC8vIGlmIG5vIG51bWJlciB3YXMgYnVtcGVkXG4gIGlmIChpbmRleCA9PT0gLTEpIHZhbHVlcy5wdXNoKDApO1xuXG4gIHJldHVybiB2YWx1ZXM7XG59XG5cbmZ1bmN0aW9uIGJ1bXBQcmVyZWxlYXNlKFxuICBwcmVyZWxlYXNlOiBSZWFkb25seUFycmF5PHN0cmluZyB8IG51bWJlcj4gPSBbXSxcbiAgaWRlbnRpZmllcjogc3RyaW5nIHwgdW5kZWZpbmVkLFxuKSB7XG4gIGxldCB2YWx1ZXMgPSBidW1wUHJlcmVsZWFzZU51bWJlcihwcmVyZWxlYXNlKTtcbiAgaWYgKCFpZGVudGlmaWVyKSByZXR1cm4gdmFsdWVzO1xuICAvLyAxLjIuMC1iZXRhLjEgYnVtcHMgdG8gMS4yLjAtYmV0YS4yLFxuICAvLyAxLjIuMC1iZXRhLmZvb2JhciBvciAxLjIuMC1iZXRhIGJ1bXBzIHRvIDEuMi4wLWJldGEuMFxuICBpZiAodmFsdWVzWzBdICE9PSBpZGVudGlmaWVyIHx8IGlzTmFOKHZhbHVlc1sxXSBhcyBudW1iZXIpKSB7XG4gICAgdmFsdWVzID0gW2lkZW50aWZpZXIsIDBdO1xuICB9XG4gIHJldHVybiB2YWx1ZXM7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmV3IHZlcnNpb24gcmVzdWx0aW5nIGZyb20gYW4gaW5jcmVtZW50IGJ5IHJlbGVhc2UgdHlwZS5cbiAqXG4gKiBgcHJlbWFqb3JgLCBgcHJlbWlub3JgIGFuZCBgcHJlcGF0Y2hgIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCB2ZXJzaW9uLFxuICogYmFzZWQgb24gdGhlIHR5cGUsIGFuZCB3aWxsIGFsc28gYWRkIHByZXJlbGVhc2UgbWV0YWRhdGEuXG4gKlxuICogSWYgY2FsbGVkIGZyb20gYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGUgYHByZXJlbGVhc2VgIHdpbGwgd29yayB0aGUgc2FtZSBhc1xuICogYHByZXBhdGNoYC4gVGhlIHBhdGNoIHZlcnNpb24gaXMgaW5jcmVtZW50ZWQgYW5kIHRoZW4gaXMgbWFkZSBpbnRvIGEgcHJlcmVsZWFzZS4gSWZcbiAqIHRoZSBpbnB1dCB2ZXJzaW9uIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlIGl0IHdpbGwgc2ltcGx5IGluY3JlbWVudCB0aGUgcHJlcmVsZWFzZVxuICogbWV0YWRhdGEuXG4gKlxuICogSWYgYSBwcmVyZWxlYXNlIGlkZW50aWZpZXIgaXMgc3BlY2lmaWVkIHdpdGhvdXQgYSBudW1iZXIgdGhlbiBhIG51bWJlciB3aWxsIGJlIGFkZGVkLlxuICogRm9yIGV4YW1wbGUgYHByZWAgd2lsbCByZXN1bHQgaW4gYHByZS4wYC4gSWYgdGhlIGV4aXN0aW5nIHZlcnNpb24gYWxyZWFkeSBoYXMgYVxuICogcHJlcmVsZWFzZSB3aXRoIGEgbnVtYmVyIGFuZCBpdHMgdGhlIHNhbWUgcHJlcmVsZWFzZSBpZGVudGlmaWVyIHRoZW4gdGhlIG51bWJlclxuICogd2lsbCBiZSBpbmNyZW1lbnRlZC4gSWYgdGhlIGlkZW50aWZpZXIgZGlmZmVycyBmcm9tIHRoZSBuZXcgaWRlbnRpZmllciB0aGVuIHRoZSBuZXdcbiAqIGlkZW50aWZpZXIgaXMgYXBwbGllZCBhbmQgdGhlIG51bWJlciBpcyByZXNldCB0byBgMGAuXG4gKlxuICogSWYgdGhlIGlucHV0IHZlcnNpb24gaGFzIGJ1aWxkIG1ldGFkYXRhIGl0IHdpbGwgYmUgcHJlc2VydmVkIG9uIHRoZSByZXN1bHRpbmcgdmVyc2lvblxuICogdW5sZXNzIGEgbmV3IGJ1aWxkIHBhcmFtZXRlciBpcyBzcGVjaWZpZWQuIFNwZWNpZnlpbmcgYFwiXCJgIHdpbGwgdW5zZXQgZXhpc3RpbmcgYnVpbGRcbiAqIG1ldGFkYXRhLlxuICogQHBhcmFtIHZlcnNpb24gVGhlIHZlcnNpb24gdG8gaW5jcmVtZW50XG4gKiBAcGFyYW0gcmVsZWFzZSBUaGUgdHlwZSBvZiBpbmNyZW1lbnQgdG8gcGVyZm9ybVxuICogQHBhcmFtIHByZXJlbGVhc2UgVGhlIHByZS1yZWxlYXNlIG1ldGFkYXRhIG9mIHRoZSBuZXcgdmVyc2lvblxuICogQHBhcmFtIGJ1aWxkIFRoZSBidWlsZCBtZXRhZGF0YSBvZiB0aGUgbmV3IHZlcnNpb25cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnQoXG4gIHZlcnNpb246IFNlbVZlcixcbiAgcmVsZWFzZTogUmVsZWFzZVR5cGUsXG4gIHByZXJlbGVhc2U/OiBzdHJpbmcsXG4gIGJ1aWxkbWV0YWRhdGE/OiBzdHJpbmcsXG4pOiBTZW1WZXIge1xuICBjb25zdCBidWlsZCA9IGJ1aWxkbWV0YWRhdGEgIT09IHVuZGVmaW5lZFxuICAgID8gcGFyc2VCdWlsZChidWlsZG1ldGFkYXRhKVxuICAgIDogdmVyc2lvbi5idWlsZDtcblxuICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICBjYXNlIFwicHJlbWFqb3JcIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yICsgMSxcbiAgICAgICAgbWlub3I6IDAsXG4gICAgICAgIHBhdGNoOiAwLFxuICAgICAgICBwcmVyZWxlYXNlOiBidW1wUHJlcmVsZWFzZSh2ZXJzaW9uLnByZXJlbGVhc2UsIHByZXJlbGVhc2UpLFxuICAgICAgICBidWlsZCxcbiAgICAgIH07XG4gICAgY2FzZSBcInByZW1pbm9yXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcbiAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IgKyAxLFxuICAgICAgICBwYXRjaDogMCxcbiAgICAgICAgcHJlcmVsZWFzZTogYnVtcFByZXJlbGVhc2UodmVyc2lvbi5wcmVyZWxlYXNlLCBwcmVyZWxlYXNlKSxcbiAgICAgICAgYnVpbGQsXG4gICAgICB9O1xuICAgIGNhc2UgXCJwcmVwYXRjaFwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXG4gICAgICAgIG1pbm9yOiB2ZXJzaW9uLm1pbm9yLFxuICAgICAgICBwYXRjaDogdmVyc2lvbi5wYXRjaCArIDEsXG4gICAgICAgIHByZXJlbGVhc2U6IGJ1bXBQcmVyZWxlYXNlKHZlcnNpb24ucHJlcmVsZWFzZSwgcHJlcmVsZWFzZSksXG4gICAgICAgIGJ1aWxkLFxuICAgICAgfTtcbiAgICBjYXNlIFwicHJlcmVsZWFzZVwiOiB7XG4gICAgICAvLyBJZiB0aGUgaW5wdXQgaXMgYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGlzIGFjdHMgdGhlIHNhbWUgYXMgcHJlcGF0Y2guXG4gICAgICBjb25zdCBpc1ByZXJlbGVhc2UgPSAodmVyc2lvbi5wcmVyZWxlYXNlID8/IFtdKS5sZW5ndGggPT09IDA7XG4gICAgICBjb25zdCBwYXRjaCA9IGlzUHJlcmVsZWFzZSA/IHZlcnNpb24ucGF0Y2ggKyAxIDogdmVyc2lvbi5wYXRjaDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yLFxuICAgICAgICBtaW5vcjogdmVyc2lvbi5taW5vcixcbiAgICAgICAgcGF0Y2gsXG4gICAgICAgIHByZXJlbGVhc2U6IGJ1bXBQcmVyZWxlYXNlKHZlcnNpb24ucHJlcmVsZWFzZSwgcHJlcmVsZWFzZSksXG4gICAgICAgIGJ1aWxkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcIm1ham9yXCI6IHtcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLiBPdGhlcndpc2UgaW5jcmVtZW50IG1ham9yLlxuICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgIGNvbnN0IGlzUHJlcmVsZWFzZSA9ICh2ZXJzaW9uLnByZXJlbGVhc2UgPz8gW10pLmxlbmd0aCA9PT0gMDtcbiAgICAgIGNvbnN0IG1ham9yID0gaXNQcmVyZWxlYXNlIHx8IHZlcnNpb24ubWlub3IgIT09IDAgfHwgdmVyc2lvbi5wYXRjaCAhPT0gMFxuICAgICAgICA/IHZlcnNpb24ubWFqb3IgKyAxXG4gICAgICAgIDogdmVyc2lvbi5tYWpvcjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yLFxuICAgICAgICBtaW5vcjogMCxcbiAgICAgICAgcGF0Y2g6IDAsXG4gICAgICAgIHByZXJlbGVhc2U6IFtdLFxuICAgICAgICBidWlsZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgXCJtaW5vclwiOiB7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi4gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBjb25zdCBpc1ByZXJlbGVhc2UgPSAodmVyc2lvbi5wcmVyZWxlYXNlID8/IFtdKS5sZW5ndGggPT09IDA7XG4gICAgICBjb25zdCBtaW5vciA9IGlzUHJlcmVsZWFzZSB8fCB2ZXJzaW9uLnBhdGNoICE9PSAwXG4gICAgICAgID8gdmVyc2lvbi5taW5vciArIDFcbiAgICAgICAgOiB2ZXJzaW9uLm1pbm9yO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXG4gICAgICAgIG1pbm9yLFxuICAgICAgICBwYXRjaDogMCxcbiAgICAgICAgcHJlcmVsZWFzZTogW10sXG4gICAgICAgIGJ1aWxkLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcInBhdGNoXCI6IHtcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgY29uc3QgaXNQcmVyZWxlYXNlID0gKHZlcnNpb24ucHJlcmVsZWFzZSA/PyBbXSkubGVuZ3RoID09PSAwO1xuICAgICAgY29uc3QgcGF0Y2ggPSBpc1ByZXJlbGVhc2UgPyB2ZXJzaW9uLnBhdGNoICsgMSA6IHZlcnNpb24ucGF0Y2g7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcbiAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXG4gICAgICAgIHBhdGNoLFxuICAgICAgICBwcmVyZWxlYXNlOiBbXSxcbiAgICAgICAgYnVpbGQsXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIFwicHJlXCI6IHtcbiAgICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTBcbiAgICAgIC8vIDEuMC4wLTAgd291bGQgYmVjb21lIDEuMC4wLTFcbiAgICAgIC8vIDEuMC4wLWJldGEuMCB3b3VsZCBiZSBjb21lIDEuMC4wLWJldGEuMVxuICAgICAgLy8gc3dpdGNoaW5nIHRoZSBwcmUgaWRlbnRpZmllciByZXNldHMgdGhlIG51bWJlciB0byAwXG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYWpvcjogdmVyc2lvbi5tYWpvcixcbiAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXG4gICAgICAgIHBhdGNoOiB2ZXJzaW9uLnBhdGNoLFxuICAgICAgICBwcmVyZWxlYXNlOiBidW1wUHJlcmVsZWFzZSh2ZXJzaW9uLnByZXJlbGVhc2UsIHByZXJlbGVhc2UpLFxuICAgICAgICBidWlsZCxcbiAgICAgIH07XG4gICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAke3JlbGVhc2V9YCk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxVQUFVLFFBQVEsZUFBZTtBQUcxQyxTQUFTLHFCQUFxQixhQUE2QyxFQUFFO0VBQzNFLE1BQU0sU0FBUztPQUFJO0dBQVc7RUFFOUIsSUFBSSxRQUFRLE9BQU8sTUFBTTtFQUN6QixNQUFPLFNBQVMsRUFBRztJQUNqQixNQUFNLFFBQVEsTUFBTSxDQUFDLE1BQU07SUFDM0IsSUFBSSxPQUFPLFVBQVUsVUFBVTtNQUM3QixNQUFNLENBQUMsTUFBTSxHQUFHLFFBQVE7TUFDeEI7SUFDRjtJQUNBLFNBQVM7RUFDWDtFQUNBLDBCQUEwQjtFQUMxQixJQUFJLFVBQVUsQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDO0VBRTlCLE9BQU87QUFDVDtBQUVBLFNBQVMsZUFDUCxhQUE2QyxF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
// denoCacheMetadata=1986025859589141358,8774207322189591687
