// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { ALL } from "./constants.ts";
import { OPERATOR_XRANGE_REGEXP, XRANGE } from "./_shared.ts";
import { parseComparator } from "./_parse_comparator.ts";
import { parseBuild, parsePrerelease } from "./_shared.ts";
function isWildcard(id) {
  return !id || id.toLowerCase() === "x" || id === "*";
}
function parseHyphenRange(range) {
  // remove spaces between comparator and groups
  range = range.replace(/(?<=<|>|=) +/, "");
  const leftMatch = range.match(new RegExp(`^${XRANGE}`));
  const leftGroup = leftMatch?.groups;
  if (!leftGroup) return range.split(/\s+/);
  const leftLength = leftMatch[0].length;
  const hyphenMatch = range.slice(leftLength).match(/^\s+-\s+/);
  if (!hyphenMatch) return range.split(/\s+/);
  const hyphenLength = hyphenMatch[0].length;
  const rightMatch = range.slice(leftLength + hyphenLength).match(
    new RegExp(`^${XRANGE}\\s*$`),
  );
  const rightGroups = rightMatch?.groups;
  if (!rightGroups) return range.split(/\s+/);
  let from = leftMatch[0];
  let to = rightMatch[0];
  if (isWildcard(leftGroup.major)) {
    from = "";
  } else if (isWildcard(leftGroup.minor)) {
    from = `>=${leftGroup.major}.0.0`;
  } else if (isWildcard(leftGroup.patch)) {
    from = `>=${leftGroup.major}.${leftGroup.minor}.0`;
  } else {
    from = `>=${from}`;
  }
  if (isWildcard(rightGroups.major)) {
    to = "";
  } else if (isWildcard(rightGroups.minor)) {
    to = `<${+rightGroups.major + 1}.0.0`;
  } else if (isWildcard(rightGroups.patch)) {
    to = `<${rightGroups.major}.${+rightGroups.minor + 1}.0`;
  } else if (rightGroups.prerelease) {
    to =
      `<=${rightGroups.major}.${rightGroups.minor}.${rightGroups.patch}-${rightGroups.prerelease}`;
  } else {
    to = `<=${to}`;
  }
  return [
    from,
    to,
  ];
}
function handleCaretOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) {
    return [
      ALL,
    ];
  }
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0,
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    if (major === 0) {
      return [
        {
          operator: ">=",
          major,
          minor,
          patch: 0,
        },
        {
          operator: "<",
          major,
          minor: minor + 1,
          patch: 0,
        },
      ];
    }
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0,
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  if (major === 0) {
    if (minor === 0) {
      return [
        {
          operator: ">=",
          major,
          minor,
          patch,
          prerelease,
        },
        {
          operator: "<",
          major,
          minor,
          patch: patch + 1,
        },
      ];
    }
    return [
      {
        operator: ">=",
        major,
        minor,
        patch,
        prerelease,
      },
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0,
      },
    ];
  }
  return [
    {
      operator: ">=",
      major,
      minor,
      patch,
      prerelease,
    },
    {
      operator: "<",
      major: major + 1,
      minor: 0,
      patch: 0,
    },
  ];
}
function handleTildeOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) {
    return [
      ALL,
    ];
  }
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0,
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0,
      },
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  return [
    {
      operator: ">=",
      major,
      minor,
      patch,
      prerelease,
    },
    {
      operator: "<",
      major,
      minor: minor + 1,
      patch: 0,
    },
  ];
}
function handleLessThanOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) {
    return [
      {
        operator: "<",
        major: 0,
        minor: 0,
        patch: 0,
      },
    ];
  }
  if (minorIsWildcard) {
    if (patchIsWildcard) {
      return [
        {
          operator: "<",
          major,
          minor: 0,
          patch: 0,
        },
      ];
    }
    return [
      {
        operator: "<",
        major,
        minor,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: "<",
        major,
        minor,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: "<",
      major,
      minor,
      patch,
      prerelease,
      build,
    },
  ];
}
function handleLessThanOrEqualOperator(groups) {
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (minorIsWildcard) {
    if (patchIsWildcard) {
      return [
        {
          operator: "<",
          major: major + 1,
          minor: 0,
          patch: 0,
        },
      ];
    }
    return [
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: "<=",
      major,
      minor,
      patch,
      prerelease,
      build,
    },
  ];
}
function handleGreaterThanOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) {
    return [
      {
        operator: "<",
        major: 0,
        minor: 0,
        patch: 0,
      },
    ];
  }
  if (minorIsWildcard) {
    if (patchIsWildcard) {
      return [
        {
          operator: ">=",
          major: major + 1,
          minor: 0,
          patch: 0,
        },
      ];
    }
    return [
      {
        operator: ">",
        major: major + 1,
        minor: 0,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">",
        major: major + 1,
        minor: 0,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: ">",
      major,
      minor,
      patch,
      prerelease,
      build,
    },
  ];
}
function handleGreaterOrEqualOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) {
    return [
      ALL,
    ];
  }
  if (minorIsWildcard) {
    if (patchIsWildcard) {
      return [
        {
          operator: ">=",
          major,
          minor: 0,
          patch: 0,
        },
      ];
    }
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: ">=",
      major,
      minor,
      patch,
      prerelease,
      build,
    },
  ];
}
function handleEqualOperator(groups) {
  const majorIsWildcard = isWildcard(groups.major);
  const minorIsWildcard = isWildcard(groups.minor);
  const patchIsWildcard = isWildcard(groups.patch);
  const major = +groups.major;
  const minor = +groups.minor;
  const patch = +groups.patch;
  if (majorIsWildcard) {
    return [
      ALL,
    ];
  }
  if (minorIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor: 0,
        patch: 0,
      },
      {
        operator: "<",
        major: major + 1,
        minor: 0,
        patch: 0,
      },
    ];
  }
  if (patchIsWildcard) {
    return [
      {
        operator: ">=",
        major,
        minor,
        patch: 0,
      },
      {
        operator: "<",
        major,
        minor: minor + 1,
        patch: 0,
      },
    ];
  }
  const prerelease = parsePrerelease(groups.prerelease ?? "");
  const build = parseBuild(groups.build ?? "");
  return [
    {
      operator: "",
      major,
      minor,
      patch,
      prerelease,
      build,
    },
  ];
}
function parseRangeString(string) {
  const groups = string.match(OPERATOR_XRANGE_REGEXP)?.groups;
  if (!groups) return parseComparator(string);
  switch (groups.operator) {
    case "^":
      return handleCaretOperator(groups);
    case "~":
    case "~>":
      return handleTildeOperator(groups);
    case "<":
      return handleLessThanOperator(groups);
    case "<=":
      return handleLessThanOrEqualOperator(groups);
    case ">":
      return handleGreaterThanOperator(groups);
    case ">=":
      return handleGreaterOrEqualOperator(groups);
    case "=":
    case "":
      return handleEqualOperator(groups);
    default:
      throw new Error(`'${groups.operator}' is not a valid operator.`);
  }
}
/**
 * Parses a range string into a Range object or throws a TypeError.
 * @param range The range set string
 * @returns A valid semantic range
 */ export function parseRange(range) {
  const ranges = range.split(/\s*\|\|\s*/).map((range) =>
    parseHyphenRange(range).flatMap(parseRangeString)
  );
  Object.defineProperty(ranges, "ranges", {
    value: ranges,
  });
  return ranges;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9wYXJzZV9yYW5nZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuaW1wb3J0IHsgQUxMIH0gZnJvbSBcIi4vY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBhcmF0b3IsIFJhbmdlIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IE9QRVJBVE9SX1hSQU5HRV9SRUdFWFAsIFhSQU5HRSB9IGZyb20gXCIuL19zaGFyZWQudHNcIjtcbmltcG9ydCB7IHBhcnNlQ29tcGFyYXRvciB9IGZyb20gXCIuL19wYXJzZV9jb21wYXJhdG9yLnRzXCI7XG5pbXBvcnQgeyBwYXJzZUJ1aWxkLCBwYXJzZVByZXJlbGVhc2UgfSBmcm9tIFwiLi9fc2hhcmVkLnRzXCI7XG5cbmZ1bmN0aW9uIGlzV2lsZGNhcmQoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09IFwieFwiIHx8IGlkID09PSBcIipcIjtcbn1cblxudHlwZSBSZWdFeHBHcm91cHMgPSB7XG4gIG9wZXJhdG9yOiBzdHJpbmc7XG4gIG1ham9yOiBzdHJpbmc7XG4gIG1pbm9yOiBzdHJpbmc7XG4gIHBhdGNoOiBzdHJpbmc7XG4gIHByZXJlbGVhc2U/OiBzdHJpbmc7XG4gIGJ1aWxkPzogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gcGFyc2VIeXBoZW5SYW5nZShyYW5nZTogc3RyaW5nKSB7XG4gIC8vIHJlbW92ZSBzcGFjZXMgYmV0d2VlbiBjb21wYXJhdG9yIGFuZCBncm91cHNcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKC8oPzw9PHw+fD0pICsvLCBcIlwiKTtcblxuICBjb25zdCBsZWZ0TWF0Y2ggPSByYW5nZS5tYXRjaChuZXcgUmVnRXhwKGBeJHtYUkFOR0V9YCkpO1xuICBjb25zdCBsZWZ0R3JvdXAgPSBsZWZ0TWF0Y2g/Lmdyb3VwcztcbiAgaWYgKCFsZWZ0R3JvdXApIHJldHVybiByYW5nZS5zcGxpdCgvXFxzKy8pO1xuICBjb25zdCBsZWZ0TGVuZ3RoID0gbGVmdE1hdGNoWzBdLmxlbmd0aDtcbiAgY29uc3QgaHlwaGVuTWF0Y2ggPSByYW5nZS5zbGljZShsZWZ0TGVuZ3RoKS5tYXRjaCgvXlxccystXFxzKy8pO1xuICBpZiAoIWh5cGhlbk1hdGNoKSByZXR1cm4gcmFuZ2Uuc3BsaXQoL1xccysvKTtcbiAgY29uc3QgaHlwaGVuTGVuZ3RoID0gaHlwaGVuTWF0Y2hbMF0ubGVuZ3RoO1xuICBjb25zdCByaWdodE1hdGNoID0gcmFuZ2Uuc2xpY2UobGVmdExlbmd0aCArIGh5cGhlbkxlbmd0aCkubWF0Y2goXG4gICAgbmV3IFJlZ0V4cChgXiR7WFJBTkdFfVxcXFxzKiRgKSxcbiAgKTtcbiAgY29uc3QgcmlnaHRHcm91cHMgPSByaWdodE1hdGNoPy5ncm91cHM7XG4gIGlmICghcmlnaHRHcm91cHMpIHJldHVybiByYW5nZS5zcGxpdCgvXFxzKy8pO1xuICBsZXQgZnJvbSA9IGxlZnRNYXRjaFswXTtcbiAgbGV0IHRvID0gcmlnaHRNYXRjaFswXTtcblxuICBpZiAoaXNXaWxkY2FyZChsZWZ0R3JvdXAubWFqb3IpKSB7XG4gICAgZnJvbSA9IFwiXCI7XG4gIH0gZWxzZSBpZiAoaXNXaWxkY2FyZChsZWZ0R3JvdXAubWlub3IpKSB7XG4gICAgZnJvbSA9IGA+PSR7bGVmdEdyb3VwLm1ham9yfS4wLjBgO1xuICB9IGVsc2UgaWYgKGlzV2lsZGNhcmQobGVmdEdyb3VwLnBhdGNoKSkge1xuICAgIGZyb20gPSBgPj0ke2xlZnRHcm91cC5tYWpvcn0uJHtsZWZ0R3JvdXAubWlub3J9LjBgO1xuICB9IGVsc2Uge1xuICAgIGZyb20gPSBgPj0ke2Zyb219YDtcbiAgfVxuXG4gIGlmIChpc1dpbGRjYXJkKHJpZ2h0R3JvdXBzLm1ham9yKSkge1xuICAgIHRvID0gXCJcIjtcbiAgfSBlbHNlIGlmIChpc1dpbGRjYXJkKHJpZ2h0R3JvdXBzLm1pbm9yKSkge1xuICAgIHRvID0gYDwkeytyaWdodEdyb3Vwcy5tYWpvciArIDF9LjAuMGA7XG4gIH0gZWxzZSBpZiAoaXNXaWxkY2FyZChyaWdodEdyb3Vwcy5wYXRjaCkpIHtcbiAgICB0byA9IGA8JHtyaWdodEdyb3Vwcy5tYWpvcn0uJHsrcmlnaHRHcm91cHMubWlub3IgKyAxfS4wYDtcbiAgfSBlbHNlIGlmIChyaWdodEdyb3Vwcy5wcmVyZWxlYXNlKSB7XG4gICAgdG8gPVxuICAgICAgYDw9JHtyaWdodEdyb3Vwcy5tYWpvcn0uJHtyaWdodEdyb3Vwcy5taW5vcn0uJHtyaWdodEdyb3Vwcy5wYXRjaH0tJHtyaWdodEdyb3Vwcy5wcmVyZWxlYXNlfWA7XG4gIH0gZWxzZSB7XG4gICAgdG8gPSBgPD0ke3RvfWA7XG4gIH1cblxuICByZXR1cm4gW2Zyb20sIHRvXTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUNhcmV0T3BlcmF0b3IoZ3JvdXBzOiBSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFtBTExdO1xuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiBtYWpvciArIDEsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIGlmIChtYWpvciA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3IsIHBhdGNoOiAwIH0sXG4gICAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfSxcbiAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfSxcbiAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvcjogbWFqb3IgKyAxLCBtaW5vcjogMCwgcGF0Y2g6IDAgfSxcbiAgICBdO1xuICB9XG5cbiAgY29uc3QgcHJlcmVsZWFzZSA9IHBhcnNlUHJlcmVsZWFzZShncm91cHMucHJlcmVsZWFzZSA/PyBcIlwiKTtcbiAgaWYgKG1ham9yID09PSAwKSB7XG4gICAgaWYgKG1pbm9yID09PSAwKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UgfSxcbiAgICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IHBhdGNoICsgMSB9LFxuICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vcjogbWlub3IgKyAxLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgcmV0dXJuIFtcbiAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2gsIHByZXJlbGVhc2UgfSxcbiAgICB7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3I6IG1ham9yICsgMSwgbWlub3I6IDAsIHBhdGNoOiAwIH0sXG4gIF07XG59XG5mdW5jdGlvbiBoYW5kbGVUaWxkZU9wZXJhdG9yKGdyb3VwczogUmVnRXhwR3JvdXBzKTogQ29tcGFyYXRvcltdIHtcbiAgY29uc3QgbWFqb3JJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMubWFqb3IpO1xuICBjb25zdCBtaW5vcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5taW5vcik7XG4gIGNvbnN0IHBhdGNoSXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLnBhdGNoKTtcblxuICBjb25zdCBtYWpvciA9ICtncm91cHMubWFqb3I7XG4gIGNvbnN0IG1pbm9yID0gK2dyb3Vwcy5taW5vcjtcbiAgY29uc3QgcGF0Y2ggPSArZ3JvdXBzLnBhdGNoO1xuXG4gIGlmIChtYWpvcklzV2lsZGNhcmQpIHJldHVybiBbQUxMXTtcbiAgaWYgKG1pbm9ySXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vcjogMCwgcGF0Y2g6IDAgfSxcbiAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvcjogbWFqb3IgKyAxLCBtaW5vcjogMCwgcGF0Y2g6IDAgfSxcbiAgICBdO1xuICB9XG4gIGlmIChwYXRjaElzV2lsZGNhcmQpIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3IsIHBhdGNoOiAwIH0sXG4gICAgICB7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3IsIG1pbm9yOiBtaW5vciArIDEsIHBhdGNoOiAwIH0sXG4gICAgXTtcbiAgfVxuICBjb25zdCBwcmVyZWxlYXNlID0gcGFyc2VQcmVyZWxlYXNlKGdyb3Vwcy5wcmVyZWxlYXNlID8/IFwiXCIpO1xuICByZXR1cm4gW1xuICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSB9LFxuICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfSxcbiAgXTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUxlc3NUaGFuT3BlcmF0b3IoZ3JvdXBzOiBSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3I6IDAsIG1pbm9yOiAwLCBwYXRjaDogMCB9XTtcbiAgaWYgKG1pbm9ySXNXaWxkY2FyZCkge1xuICAgIGlmIChwYXRjaElzV2lsZGNhcmQpIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gICAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3IsIG1pbm9yLCBwYXRjaDogMCB9XTtcbiAgfVxuICBpZiAocGF0Y2hJc1dpbGRjYXJkKSByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3IsIHBhdGNoOiAwIH1dO1xuICBjb25zdCBwcmVyZWxlYXNlID0gcGFyc2VQcmVyZWxlYXNlKGdyb3Vwcy5wcmVyZWxlYXNlID8/IFwiXCIpO1xuICBjb25zdCBidWlsZCA9IHBhcnNlQnVpbGQoZ3JvdXBzLmJ1aWxkID8/IFwiXCIpO1xuICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3IsIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZCB9XTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUxlc3NUaGFuT3JFcXVhbE9wZXJhdG9yKGdyb3VwczogUmVnRXhwR3JvdXBzKTogQ29tcGFyYXRvcltdIHtcbiAgY29uc3QgbWlub3JJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMubWlub3IpO1xuICBjb25zdCBwYXRjaElzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5wYXRjaCk7XG5cbiAgY29uc3QgbWFqb3IgPSArZ3JvdXBzLm1ham9yO1xuICBjb25zdCBtaW5vciA9ICtncm91cHMubWlub3I7XG4gIGNvbnN0IHBhdGNoID0gK2dyb3Vwcy5wYXRjaDtcblxuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgICAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIjxcIiwgbWFqb3I6IG1ham9yICsgMSwgbWlub3I6IDAsIHBhdGNoOiAwIH1dO1xuICAgIH1cbiAgICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yLCBtaW5vcjogbWlub3IgKyAxLCBwYXRjaDogMCB9XTtcbiAgfVxuICBjb25zdCBwcmVyZWxlYXNlID0gcGFyc2VQcmVyZWxlYXNlKGdyb3Vwcy5wcmVyZWxlYXNlID8/IFwiXCIpO1xuICBjb25zdCBidWlsZCA9IHBhcnNlQnVpbGQoZ3JvdXBzLmJ1aWxkID8/IFwiXCIpO1xuICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPD1cIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGQgfV07XG59XG5mdW5jdGlvbiBoYW5kbGVHcmVhdGVyVGhhbk9wZXJhdG9yKGdyb3VwczogUmVnRXhwR3JvdXBzKTogQ29tcGFyYXRvcltdIHtcbiAgY29uc3QgbWFqb3JJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMubWFqb3IpO1xuICBjb25zdCBtaW5vcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5taW5vcik7XG4gIGNvbnN0IHBhdGNoSXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLnBhdGNoKTtcblxuICBjb25zdCBtYWpvciA9ICtncm91cHMubWFqb3I7XG4gIGNvbnN0IG1pbm9yID0gK2dyb3Vwcy5taW5vcjtcbiAgY29uc3QgcGF0Y2ggPSArZ3JvdXBzLnBhdGNoO1xuXG4gIGlmIChtYWpvcklzV2lsZGNhcmQpIHJldHVybiBbeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiAwLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gIGlmIChtaW5vcklzV2lsZGNhcmQpIHtcbiAgICBpZiAocGF0Y2hJc1dpbGRjYXJkKSB7XG4gICAgICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3I6IG1ham9yICsgMSwgbWlub3I6IDAsIHBhdGNoOiAwIH1dO1xuICAgIH1cbiAgICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPlwiLCBtYWpvcjogbWFqb3IgKyAxLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbeyBvcGVyYXRvcjogXCI+XCIsIG1ham9yOiBtYWpvciArIDEsIG1pbm9yOiAwLCBwYXRjaDogMCB9XTtcbiAgfVxuICBjb25zdCBwcmVyZWxlYXNlID0gcGFyc2VQcmVyZWxlYXNlKGdyb3Vwcy5wcmVyZWxlYXNlID8/IFwiXCIpO1xuICBjb25zdCBidWlsZCA9IHBhcnNlQnVpbGQoZ3JvdXBzLmJ1aWxkID8/IFwiXCIpO1xuICByZXR1cm4gW3sgb3BlcmF0b3I6IFwiPlwiLCBtYWpvciwgbWlub3IsIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZCB9XTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUdyZWF0ZXJPckVxdWFsT3BlcmF0b3IoZ3JvdXBzOiBSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFtBTExdO1xuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgaWYgKHBhdGNoSXNXaWxkY2FyZCkgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vcjogMCwgcGF0Y2g6IDAgfV07XG4gICAgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfV07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkgcmV0dXJuIFt7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfV07XG4gIGNvbnN0IHByZXJlbGVhc2UgPSBwYXJzZVByZXJlbGVhc2UoZ3JvdXBzLnByZXJlbGVhc2UgPz8gXCJcIik7XG4gIGNvbnN0IGJ1aWxkID0gcGFyc2VCdWlsZChncm91cHMuYnVpbGQgPz8gXCJcIik7XG4gIHJldHVybiBbeyBvcGVyYXRvcjogXCI+PVwiLCBtYWpvciwgbWlub3IsIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZCB9XTtcbn1cbmZ1bmN0aW9uIGhhbmRsZUVxdWFsT3BlcmF0b3IoZ3JvdXBzOiBSZWdFeHBHcm91cHMpOiBDb21wYXJhdG9yW10ge1xuICBjb25zdCBtYWpvcklzV2lsZGNhcmQgPSBpc1dpbGRjYXJkKGdyb3Vwcy5tYWpvcik7XG4gIGNvbnN0IG1pbm9ySXNXaWxkY2FyZCA9IGlzV2lsZGNhcmQoZ3JvdXBzLm1pbm9yKTtcbiAgY29uc3QgcGF0Y2hJc1dpbGRjYXJkID0gaXNXaWxkY2FyZChncm91cHMucGF0Y2gpO1xuXG4gIGNvbnN0IG1ham9yID0gK2dyb3Vwcy5tYWpvcjtcbiAgY29uc3QgbWlub3IgPSArZ3JvdXBzLm1pbm9yO1xuICBjb25zdCBwYXRjaCA9ICtncm91cHMucGF0Y2g7XG5cbiAgaWYgKG1ham9ySXNXaWxkY2FyZCkgcmV0dXJuIFtBTExdO1xuICBpZiAobWlub3JJc1dpbGRjYXJkKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgb3BlcmF0b3I6IFwiPj1cIiwgbWFqb3IsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgICAgeyBvcGVyYXRvcjogXCI8XCIsIG1ham9yOiBtYWpvciArIDEsIG1pbm9yOiAwLCBwYXRjaDogMCB9LFxuICAgIF07XG4gIH1cbiAgaWYgKHBhdGNoSXNXaWxkY2FyZCkge1xuICAgIHJldHVybiBbXG4gICAgICB7IG9wZXJhdG9yOiBcIj49XCIsIG1ham9yLCBtaW5vciwgcGF0Y2g6IDAgfSxcbiAgICAgIHsgb3BlcmF0b3I6IFwiPFwiLCBtYWpvciwgbWlub3I6IG1pbm9yICsgMSwgcGF0Y2g6IDAgfSxcbiAgICBdO1xuICB9XG4gIGNvbnN0IHByZXJlbGVhc2UgPSBwYXJzZVByZXJlbGVhc2UoZ3JvdXBzLnByZXJlbGVhc2UgPz8gXCJcIik7XG4gIGNvbnN0IGJ1aWxkID0gcGFyc2VCdWlsZChncm91cHMuYnVpbGQgPz8gXCJcIik7XG4gIHJldHVybiBbeyBvcGVyYXRvcjogXCJcIiwgbWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGQgfV07XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmFuZ2VTdHJpbmcoc3RyaW5nOiBzdHJpbmcpIHtcbiAgY29uc3QgZ3JvdXBzID0gc3RyaW5nLm1hdGNoKE9QRVJBVE9SX1hSQU5HRV9SRUdFWFApPy5ncm91cHMgYXMgUmVnRXhwR3JvdXBzO1xuICBpZiAoIWdyb3VwcykgcmV0dXJuIHBhcnNlQ29tcGFyYXRvcihzdHJpbmcpO1xuXG4gIHN3aXRjaCAoZ3JvdXBzLm9wZXJhdG9yKSB7XG4gICAgY2FzZSBcIl5cIjpcbiAgICAgIHJldHVybiBoYW5kbGVDYXJldE9wZXJhdG9yKGdyb3Vwcyk7XG4gICAgY2FzZSBcIn5cIjpcbiAgICBjYXNlIFwifj5cIjpcbiAgICAgIHJldHVybiBoYW5kbGVUaWxkZU9wZXJhdG9yKGdyb3Vwcyk7XG4gICAgY2FzZSBcIjxcIjpcbiAgICAgIHJldHVybiBoYW5kbGVMZXNzVGhhbk9wZXJhdG9yKGdyb3Vwcyk7XG4gICAgY2FzZSBcIjw9XCI6XG4gICAgICByZXR1cm4gaGFuZGxlTGVzc1RoYW5PckVxdWFsT3BlcmF0b3IoZ3JvdXBzKTtcbiAgICBjYXNlIFwiPlwiOlxuICAgICAgcmV0dXJuIGhhbmRsZUdyZWF0ZXJUaGFuT3BlcmF0b3IoZ3JvdXBzKTtcbiAgICBjYXNlIFwiPj1cIjpcbiAgICAgIHJldHVybiBoYW5kbGVHcmVhdGVyT3JFcXVhbE9wZXJhdG9yKGdyb3Vwcyk7XG4gICAgY2FzZSBcIj1cIjpcbiAgICBjYXNlIFwiXCI6XG4gICAgICByZXR1cm4gaGFuZGxlRXF1YWxPcGVyYXRvcihncm91cHMpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2dyb3Vwcy5vcGVyYXRvcn0nIGlzIG5vdCBhIHZhbGlkIG9wZXJhdG9yLmApO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2VzIGEgcmFuZ2Ugc3RyaW5nIGludG8gYSBSYW5nZSBvYmplY3Qgb3IgdGhyb3dzIGEgVHlwZUVycm9yLlxuICogQHBhcmFtIHJhbmdlIFRoZSByYW5nZSBzZXQgc3RyaW5nXG4gKiBAcmV0dXJucyBBIHZhbGlkIHNlbWFudGljIHJhbmdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVJhbmdlKHJhbmdlOiBzdHJpbmcpOiBSYW5nZSB7XG4gIGNvbnN0IHJhbmdlcyA9IHJhbmdlXG4gICAgLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pXG4gICAgLm1hcCgocmFuZ2UpID0+IHBhcnNlSHlwaGVuUmFuZ2UocmFuZ2UpLmZsYXRNYXAocGFyc2VSYW5nZVN0cmluZykpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmFuZ2VzLCBcInJhbmdlc1wiLCB7IHZhbHVlOiByYW5nZXMgfSk7XG4gIHJldHVybiByYW5nZXMgYXMgUmFuZ2U7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsR0FBRyxRQUFRLGlCQUFpQjtBQUVyQyxTQUFTLHNCQUFzQixFQUFFLE1BQU0sUUFBUSxlQUFlO0FBQzlELFNBQVMsZUFBZSxRQUFRLHlCQUF5QjtBQUN6RCxTQUFTLFVBQVUsRUFBRSxlQUFlLFFBQVEsZUFBZTtBQUUzRCxTQUFTLFdBQVcsRUFBVTtFQUM1QixPQUFPLENBQUMsTUFBTSxHQUFHLFdBQVcsT0FBTyxPQUFPLE9BQU87QUFDbkQ7QUFXQSxTQUFTLGlCQUFpQixLQUFhO0VBQ3JDLDhDQUE4QztFQUM5QyxRQUFRLE1BQU0sT0FBTyxDQUFDLGdCQUFnQjtFQUV0QyxNQUFNLFlBQVksTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVE7RUFDckQsTUFBTSxZQUFZLFdBQVc7RUFDN0IsSUFBSSxDQUFDLFdBQVcsT0FBTyxNQUFNLEtBQUssQ0FBQztFQUNuQyxNQUFNLGFBQWEsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNO0VBQ3RDLE1BQU0sY0FBYyxNQUFNLEtBQUssQ0FBQyxZQUFZLEtBQUssQ0FBQztFQUNsRCxJQUFJLENBQUMsYUFBYSxPQUFPLE1BQU0sS0FBSyxDQUFDO0VBQ3JDLE1BQU0sZUFBZSxXQUFXLENBQUMsRUFBRSxDQUFDLE1BQU07RUFDMUMsTUFBTSxhQUFhLE1BQU0sS0FBSyxDQUFDLGFBQWEsY0FBYyxLQUFLLENBQzdELElBQUksT0FBTyxDQUFDLENB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
// denoCacheMetadata=2110652576316058656,11045650166971764618
