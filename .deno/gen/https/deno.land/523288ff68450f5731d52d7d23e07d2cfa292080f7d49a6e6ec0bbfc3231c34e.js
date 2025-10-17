// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Command line arguments parser based on
 * {@link https://github.com/minimistjs/minimist | minimist}.
 *
 * This module is browser compatible.
 *
 * @example
 * ```ts
 * import { parse } from "https://deno.land/std@$STD_VERSION/flags/mod.ts";
 *
 * console.dir(parse(Deno.args));
 * ```
 *
 * @deprecated (will be removed in 1.0.0) Import from
 * {@link https://deno.land/std/cli/parse_args.ts} instead.
 *
 * @module
 */
import { assertExists } from "../assert/assert_exists.ts";
const { hasOwn } = Object;
function get(obj, key) {
  if (hasOwn(obj, key)) {
    return obj[key];
  }
}
function getForce(obj, key) {
  const v = get(obj, key);
  assertExists(v);
  return v;
}
function isNumber(x) {
  if (typeof x === "number") return true;
  if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
  let o = obj;
  keys.slice(0, -1).forEach((key) => {
    o = get(o, key) ?? {};
  });
  const key = keys.at(-1);
  return key !== undefined && hasOwn(o, key);
}
/**
 * Take a set of command line arguments, optionally with a set of options, and
 * return an object representing the flags found in the passed arguments.
 *
 * By default, any arguments starting with `-` or `--` are considered boolean
 * flags. If the argument name is followed by an equal sign (`=`) it is
 * considered a key-value pair. Any arguments which could not be parsed are
 * available in the `_` property of the returned object.
 *
 * By default, the flags module tries to determine the type of all arguments
 * automatically and the return type of the `parse` method will have an index
 * signature with `any` as value (`{ [x: string]: any }`).
 *
 * If the `string`, `boolean` or `collect` option is set, the return value of
 * the `parse` method will be fully typed and the index signature of the return
 * type will change to `{ [x: string]: unknown }`.
 *
 * Any arguments after `'--'` will not be parsed and will end up in `parsedArgs._`.
 *
 * Numeric-looking arguments will be returned as numbers unless `options.string`
 * or `options.boolean` is set for that argument name.
 *
 * @example
 * ```ts
 * import { parse } from "https://deno.land/std@$STD_VERSION/flags/mod.ts";
 * const parsedArgs = parse(Deno.args);
 * ```
 *
 * @example
 * ```ts
 * import { parse } from "https://deno.land/std@$STD_VERSION/flags/mod.ts";
 * const parsedArgs = parse(["--foo", "--bar=baz", "./quux.txt"]);
 * // parsedArgs: { foo: true, bar: "baz", _: ["./quux.txt"] }
 * ```
 *
 * @deprecated (will be removed in 1.0.0) Use
 * {@linkcode https://deno.land/std/cli/parse_args.ts?s=parseArgs | parseArgs}
 * instead.
 */ export function parse(
  args,
  {
    "--": doubleDash = false,
    alias = {},
    boolean = false,
    default: defaults = {},
    stopEarly = false,
    string = [],
    collect = [],
    negatable = [],
    unknown = (i) => i,
  } = {},
) {
  const aliases = {};
  const flags = {
    bools: {},
    strings: {},
    unknownFn: unknown,
    allBools: false,
    collect: {},
    negatable: {},
  };
  if (alias !== undefined) {
    for (const key in alias) {
      const val = getForce(alias, key);
      if (typeof val === "string") {
        aliases[key] = [
          val,
        ];
      } else {
        aliases[key] = val;
      }
      const aliasesForKey = getForce(aliases, key);
      for (const alias of aliasesForKey) {
        aliases[alias] = [
          key,
        ].concat(aliasesForKey.filter((y) => alias !== y));
      }
    }
  }
  if (boolean !== undefined) {
    if (typeof boolean === "boolean") {
      flags.allBools = !!boolean;
    } else {
      const booleanArgs = typeof boolean === "string"
        ? [
          boolean,
        ]
        : boolean;
      for (const key of booleanArgs.filter(Boolean)) {
        flags.bools[key] = true;
        const alias = get(aliases, key);
        if (alias) {
          for (const al of alias) {
            flags.bools[al] = true;
          }
        }
      }
    }
  }
  if (string !== undefined) {
    const stringArgs = typeof string === "string"
      ? [
        string,
      ]
      : string;
    for (const key of stringArgs.filter(Boolean)) {
      flags.strings[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias) {
          flags.strings[al] = true;
        }
      }
    }
  }
  if (collect !== undefined) {
    const collectArgs = typeof collect === "string"
      ? [
        collect,
      ]
      : collect;
    for (const key of collectArgs.filter(Boolean)) {
      flags.collect[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias) {
          flags.collect[al] = true;
        }
      }
    }
  }
  if (negatable !== undefined) {
    const negatableArgs = typeof negatable === "string"
      ? [
        negatable,
      ]
      : negatable;
    for (const key of negatableArgs.filter(Boolean)) {
      flags.negatable[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias) {
          flags.negatable[al] = true;
        }
      }
    }
  }
  const argv = {
    _: [],
  };
  function argDefined(key, arg) {
    return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key) ||
      !!get(flags.strings, key) || !!get(aliases, key);
  }
  function setKey(obj, name, value, collect = true) {
    let o = obj;
    const keys = name.split(".");
    keys.slice(0, -1).forEach(function (key) {
      if (get(o, key) === undefined) {
        o[key] = {};
      }
      o = get(o, key);
    });
    const key = keys.at(-1);
    const collectable = collect && !!get(flags.collect, name);
    if (!collectable) {
      o[key] = value;
    } else if (get(o, key) === undefined) {
      o[key] = [
        value,
      ];
    } else if (Array.isArray(get(o, key))) {
      o[key].push(value);
    } else {
      o[key] = [
        get(o, key),
        value,
      ];
    }
  }
  function setArg(key, val, arg = undefined, collect) {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg, key, val) === false) return;
    }
    const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
    setKey(argv, key, value, collect);
    const alias = get(aliases, key);
    if (alias) {
      for (const x of alias) {
        setKey(argv, x, value, collect);
      }
    }
  }
  function aliasIsBoolean(key) {
    return getForce(aliases, key).some((x) =>
      typeof get(flags.bools, x) === "boolean"
    );
  }
  let notFlags = [];
  // all args after "--" are not parsed
  if (args.includes("--")) {
    notFlags = args.slice(args.indexOf("--") + 1);
    args = args.slice(0, args.indexOf("--"));
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    assertExists(arg);
    if (/^--.+=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=(.*)$/s);
      assertExists(m);
      const [, key, value] = m;
      assertExists(key);
      if (flags.bools[key]) {
        const booleanValue = value !== "false";
        setArg(key, booleanValue, arg);
      } else {
        setArg(key, value, arg);
      }
    } else if (
      /^--no-.+/.test(arg) && get(flags.negatable, arg.replace(/^--no-/, ""))
    ) {
      const m = arg.match(/^--no-(.+)/);
      assertExists(m);
      assertExists(m[1]);
      setArg(m[1], false, arg, false);
    } else if (/^--.+/.test(arg)) {
      const m = arg.match(/^--(.+)/);
      assertExists(m);
      assertExists(m[1]);
      const [, key] = m;
      const next = args[i + 1];
      if (
        next !== undefined && !/^-/.test(next) && !get(flags.bools, key) &&
        !flags.allBools && (get(aliases, key) ? !aliasIsBoolean(key) : true)
      ) {
        setArg(key, next, arg);
        i++;
      } else if (next !== undefined && (next === "true" || next === "false")) {
        setArg(key, next === "true", arg);
        i++;
      } else {
        setArg(key, get(flags.strings, key) ? "" : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      const letters = arg.slice(1, -1).split("");
      let broken = false;
      for (const [j, letter] of letters.entries()) {
        const next = arg.slice(j + 2);
        if (next === "-") {
          setArg(letter, next, arg);
          continue;
        }
        if (/[A-Za-z]/.test(letter) && next.includes("=")) {
          setArg(letter, next.split(/=(.+)/)[1], arg);
          broken = true;
          break;
        }
        if (/[A-Za-z]/.test(letter) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letter, next, arg);
          broken = true;
          break;
        }
        if (letters[j + 1]?.match(/\W/)) {
          setArg(letter, arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          setArg(letter, get(flags.strings, letter) ? "" : true, arg);
        }
      }
      const key = arg.at(-1);
      if (!broken && key !== "-") {
        const nextArg = args[i + 1];
        if (
          nextArg && !/^(-|--)[^-]/.test(nextArg) && !get(flags.bools, key) &&
          (get(aliases, key) ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, nextArg, arg);
          i++;
        } else if (nextArg && (nextArg === "true" || nextArg === "false")) {
          setArg(key, nextArg === "true", arg);
          i++;
        } else {
          setArg(key, get(flags.strings, key) ? "" : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
      }
      if (stopEarly) {
        argv._.push(...args.slice(i + 1));
        break;
      }
    }
  }
  for (const [key, value] of Object.entries(defaults)) {
    if (!hasKey(argv, key.split("."))) {
      setKey(argv, key, value, false);
      const alias = aliases[key];
      if (alias !== undefined) {
        for (const x of alias) {
          setKey(argv, x, value, false);
        }
      }
    }
  }
  for (const key of Object.keys(flags.bools)) {
    if (!hasKey(argv, key.split("."))) {
      const value = get(flags.collect, key) ? [] : false;
      setKey(argv, key, value, false);
    }
  }
  for (const key of Object.keys(flags.strings)) {
    if (!hasKey(argv, key.split(".")) && get(flags.collect, key)) {
      setKey(argv, key, [], false);
    }
  }
  if (doubleDash) {
    argv["--"] = [];
    for (const key of notFlags) {
      argv["--"].push(key);
    }
  } else {
    for (const key of notFlags) {
      argv._.push(key);
    }
  }
  return argv;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZsYWdzL21vZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0IHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIENvbW1hbmQgbGluZSBhcmd1bWVudHMgcGFyc2VyIGJhc2VkIG9uXG4gKiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL21pbmltaXN0anMvbWluaW1pc3QgfCBtaW5pbWlzdH0uXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9mbGFncy9tb2QudHNcIjtcbiAqXG4gKiBjb25zb2xlLmRpcihwYXJzZShEZW5vLmFyZ3MpKTtcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkICh3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjApIEltcG9ydCBmcm9tXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2NsaS9wYXJzZV9hcmdzLnRzfSBpbnN0ZWFkLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgYXNzZXJ0RXhpc3RzIH0gZnJvbSBcIi4uL2Fzc2VydC9hc3NlcnRfZXhpc3RzLnRzXCI7XG5cbi8qKiBDb21iaW5lcyByZWN1cnNpdmVseSBhbGwgaW50ZXJzZWN0aW9uIHR5cGVzIGFuZCByZXR1cm5zIGEgbmV3IHNpbmdsZSB0eXBlLiAqL1xudHlwZSBJZDxUUmVjb3JkPiA9IFRSZWNvcmQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICA/IFRSZWNvcmQgZXh0ZW5kcyBpbmZlciBJbmZlcnJlZFJlY29yZFxuICAgID8geyBbS2V5IGluIGtleW9mIEluZmVycmVkUmVjb3JkXTogSWQ8SW5mZXJyZWRSZWNvcmRbS2V5XT4gfVxuICA6IG5ldmVyXG4gIDogVFJlY29yZDtcblxuLyoqIENvbnZlcnRzIGEgdW5pb24gdHlwZSBgQSB8IEIgfCBDYCBpbnRvIGFuIGludGVyc2VjdGlvbiB0eXBlIGBBICYgQiAmIENgLiAqL1xudHlwZSBVbmlvblRvSW50ZXJzZWN0aW9uPFRWYWx1ZT4gPVxuICAoVFZhbHVlIGV4dGVuZHMgdW5rbm93biA/IChhcmdzOiBUVmFsdWUpID0+IHVua25vd24gOiBuZXZlcikgZXh0ZW5kc1xuICAgIChhcmdzOiBpbmZlciBSKSA9PiB1bmtub3duID8gUiBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ID8gUiA6IG5ldmVyXG4gICAgOiBuZXZlcjtcblxudHlwZSBCb29sZWFuVHlwZSA9IGJvb2xlYW4gfCBzdHJpbmcgfCB1bmRlZmluZWQ7XG50eXBlIFN0cmluZ1R5cGUgPSBzdHJpbmcgfCB1bmRlZmluZWQ7XG50eXBlIEFyZ1R5cGUgPSBTdHJpbmdUeXBlIHwgQm9vbGVhblR5cGU7XG5cbnR5cGUgQ29sbGVjdGFibGUgPSBzdHJpbmcgfCB1bmRlZmluZWQ7XG50eXBlIE5lZ2F0YWJsZSA9IHN0cmluZyB8IHVuZGVmaW5lZDtcblxudHlwZSBVc2VUeXBlczxcbiAgVEJvb2xlYW5zIGV4dGVuZHMgQm9vbGVhblR5cGUsXG4gIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZSxcbiAgVENvbGxlY3RhYmxlIGV4dGVuZHMgQ29sbGVjdGFibGUsXG4+ID0gdW5kZWZpbmVkIGV4dGVuZHMgKFxuICAmIChmYWxzZSBleHRlbmRzIFRCb29sZWFucyA/IHVuZGVmaW5lZCA6IFRCb29sZWFucylcbiAgJiBUQ29sbGVjdGFibGVcbiAgJiBUU3RyaW5nc1xuKSA/IGZhbHNlXG4gIDogdHJ1ZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVjb3JkIHdpdGggYWxsIGF2YWlsYWJsZSBmbGFncyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHR5cGUgYW5kXG4gKiBkZWZhdWx0IHR5cGUuXG4gKi9cbnR5cGUgVmFsdWVzPFxuICBUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSxcbiAgVFN0cmluZ3MgZXh0ZW5kcyBTdHJpbmdUeXBlLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSxcbiAgVE5lZ2F0YWJsZSBleHRlbmRzIE5lZ2F0YWJsZSxcbiAgVERlZmF1bHQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCxcbiAgVEFsaWFzZXMgZXh0ZW5kcyBBbGlhc2VzIHwgdW5kZWZpbmVkLFxuPiA9IFVzZVR5cGVzPFRCb29sZWFucywgVFN0cmluZ3MsIFRDb2xsZWN0YWJsZT4gZXh0ZW5kcyB0cnVlID9cbiAgICAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgJiBBZGRBbGlhc2VzPFxuICAgICAgU3ByZWFkRGVmYXVsdHM8XG4gICAgICAgICYgQ29sbGVjdFZhbHVlczxUU3RyaW5ncywgc3RyaW5nLCBUQ29sbGVjdGFibGUsIFROZWdhdGFibGU+XG4gICAgICAgICYgUmVjdXJzaXZlUmVxdWlyZWQ8Q29sbGVjdFZhbHVlczxUQm9vbGVhbnMsIGJvb2xlYW4sIFRDb2xsZWN0YWJsZT4+XG4gICAgICAgICYgQ29sbGVjdFVua25vd25WYWx1ZXM8XG4gICAgICAgICAgVEJvb2xlYW5zLFxuICAgICAgICAgIFRTdHJpbmdzLFxuICAgICAgICAgIFRDb2xsZWN0YWJsZSxcbiAgICAgICAgICBUTmVnYXRhYmxlXG4gICAgICAgID4sXG4gICAgICAgIERlZG90UmVjb3JkPFREZWZhdWx0PlxuICAgICAgPixcbiAgICAgIFRBbGlhc2VzXG4gICAgPlxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICA6IFJlY29yZDxzdHJpbmcsIGFueT47XG5cbnR5cGUgQWxpYXNlczxUQXJnTmFtZXMgPSBzdHJpbmcsIFRBbGlhc05hbWVzIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiA9IFBhcnRpYWw8XG4gIFJlY29yZDxFeHRyYWN0PFRBcmdOYW1lcywgc3RyaW5nPiwgVEFsaWFzTmFtZXMgfCBSZWFkb25seUFycmF5PFRBbGlhc05hbWVzPj5cbj47XG5cbnR5cGUgQWRkQWxpYXNlczxcbiAgVEFyZ3MsXG4gIFRBbGlhc2VzIGV4dGVuZHMgQWxpYXNlcyB8IHVuZGVmaW5lZCxcbj4gPSB7XG4gIFtUQXJnTmFtZSBpbiBrZXlvZiBUQXJncyBhcyBBbGlhc05hbWVzPFRBcmdOYW1lLCBUQWxpYXNlcz5dOiBUQXJnc1tUQXJnTmFtZV07XG59O1xuXG50eXBlIEFsaWFzTmFtZXM8XG4gIFRBcmdOYW1lLFxuICBUQWxpYXNlcyBleHRlbmRzIEFsaWFzZXMgfCB1bmRlZmluZWQsXG4+ID0gVEFyZ05hbWUgZXh0ZW5kcyBrZXlvZiBUQWxpYXNlc1xuICA/IHN0cmluZyBleHRlbmRzIFRBbGlhc2VzW1RBcmdOYW1lXSA/IFRBcmdOYW1lXG4gIDogVEFsaWFzZXNbVEFyZ05hbWVdIGV4dGVuZHMgc3RyaW5nID8gVEFyZ05hbWUgfCBUQWxpYXNlc1tUQXJnTmFtZV1cbiAgOiBUQWxpYXNlc1tUQXJnTmFtZV0gZXh0ZW5kcyBBcnJheTxzdHJpbmc+XG4gICAgPyBUQXJnTmFtZSB8IFRBbGlhc2VzW1RBcmdOYW1lXVtudW1iZXJdXG4gIDogVEFyZ05hbWVcbiAgOiBUQXJnTmFtZTtcblxuLyoqXG4gKiBTcHJlYWRzIGFsbCBkZWZhdWx0IHZhbHVlcyBvZiBSZWNvcmQgYFREZWZhdWx0c2AgaW50byBSZWNvcmQgYFRBcmdzYFxuICogYW5kIG1ha2VzIGRlZmF1bHQgdmFsdWVzIHJlcXVpcmVkLlxuICpcbiAqICoqRXhhbXBsZToqKlxuICogYFNwcmVhZFZhbHVlczx7IGZvbz86IGJvb2xlYW4sIGJhcj86IG51bWJlciB9LCB7IGZvbzogbnVtYmVyIH0+YFxuICpcbiAqICoqUmVzdWx0OioqIGB7IGZvbzogYm9vbGVhbiB8IG51bWJlciwgYmFyPzogbnVtYmVyIH1gXG4gKi9cbnR5cGUgU3ByZWFkRGVmYXVsdHM8VEFyZ3MsIFREZWZhdWx0cz4gPSBURGVmYXVsdHMgZXh0ZW5kcyB1bmRlZmluZWQgPyBUQXJnc1xuICA6IFRBcmdzIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gP1xuICAgICAgJiBPbWl0PFRBcmdzLCBrZXlvZiBURGVmYXVsdHM+XG4gICAgICAmIHtcbiAgICAgICAgW0RlZmF1bHQgaW4ga2V5b2YgVERlZmF1bHRzXTogRGVmYXVsdCBleHRlbmRzIGtleW9mIFRBcmdzXG4gICAgICAgICAgPyAoVEFyZ3NbRGVmYXVsdF0gJiBURGVmYXVsdHNbRGVmYXVsdF0gfCBURGVmYXVsdHNbRGVmYXVsdF0pIGV4dGVuZHNcbiAgICAgICAgICAgIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgICAgICAgICA/IE5vbk51bGxhYmxlPFNwcmVhZERlZmF1bHRzPFRBcmdzW0RlZmF1bHRdLCBURGVmYXVsdHNbRGVmYXVsdF0+PlxuICAgICAgICAgIDogVERlZmF1bHRzW0RlZmF1bHRdIHwgTm9uTnVsbGFibGU8VEFyZ3NbRGVmYXVsdF0+XG4gICAgICAgICAgOiB1bmtub3duO1xuICAgICAgfVxuICA6IG5ldmVyO1xuXG4vKipcbiAqIERlZmluZXMgdGhlIFJlY29yZCBmb3IgdGhlIGBkZWZhdWx0YCBvcHRpb24gdG8gYWRkXG4gKiBhdXRvLXN1Z2dlc3Rpb24gc3VwcG9ydCBmb3IgSURFJ3MuXG4gKi9cbnR5cGUgRGVmYXVsdHM8VEJvb2xlYW5zIGV4dGVuZHMgQm9vbGVhblR5cGUsIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZT4gPSBJZDxcbiAgVW5pb25Ub0ludGVyc2VjdGlvbjxcbiAgICAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gICAgLy8gRGVkb3R0ZWQgYXV0byBzdWdnZXN0aW9uczogeyBmb286IHsgYmFyOiB1bmtub3duIH0gfVxuICAgICYgTWFwVHlwZXM8VFN0cmluZ3MsIHVua25vd24+XG4gICAgJiBNYXBUeXBlczxUQm9vbGVhbnMsIHVua25vd24+XG4gICAgLy8gRmxhdCBhdXRvIHN1Z2dlc3Rpb25zOiB7IFwiZm9vLmJhclwiOiB1bmtub3duIH1cbiAgICAmIE1hcERlZmF1bHRzPFRCb29sZWFucz5cbiAgICAmIE1hcERlZmF1bHRzPFRTdHJpbmdzPlxuICA+XG4+O1xuXG50eXBlIE1hcERlZmF1bHRzPFRBcmdOYW1lcyBleHRlbmRzIEFyZ1R5cGU+ID0gUGFydGlhbDxcbiAgUmVjb3JkPFRBcmdOYW1lcyBleHRlbmRzIHN0cmluZyA/IFRBcmdOYW1lcyA6IHN0cmluZywgdW5rbm93bj5cbj47XG5cbnR5cGUgUmVjdXJzaXZlUmVxdWlyZWQ8VFJlY29yZD4gPSBUUmVjb3JkIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPyB7XG4gICAgW0tleSBpbiBrZXlvZiBUUmVjb3JkXS0/OiBSZWN1cnNpdmVSZXF1aXJlZDxUUmVjb3JkW0tleV0+O1xuICB9XG4gIDogVFJlY29yZDtcblxuLyoqIFNhbWUgYXMgYE1hcFR5cGVzYCBidXQgYWxzbyBzdXBwb3J0cyBjb2xsZWN0YWJsZSBvcHRpb25zLiAqL1xudHlwZSBDb2xsZWN0VmFsdWVzPFxuICBUQXJnTmFtZXMgZXh0ZW5kcyBBcmdUeXBlLFxuICBUVHlwZSxcbiAgVENvbGxlY3RhYmxlIGV4dGVuZHMgQ29sbGVjdGFibGUsXG4gIFROZWdhdGFibGUgZXh0ZW5kcyBOZWdhdGFibGUgPSB1bmRlZmluZWQsXG4+ID0gVW5pb25Ub0ludGVyc2VjdGlvbjxcbiAgRXh0cmFjdDxUQXJnTmFtZXMsIFRDb2xsZWN0YWJsZT4gZXh0ZW5kcyBzdHJpbmcgP1xuICAgICAgJiAoRXhjbHVkZTxUQXJnTmFtZXMsIFRDb2xsZWN0YWJsZT4gZXh0ZW5kcyBuZXZlciA/IFJlY29yZDxuZXZlciwgbmV2ZXI+XG4gICAgICAgIDogTWFwVHlwZXM8RXhjbHVkZTxUQXJnTmFtZXMsIFRDb2xsZWN0YWJsZT4sIFRUeXBlLCBUTmVnYXRhYmxlPilcbiAgICAgICYgKEV4dHJhY3Q8VEFyZ05hbWVzLCBUQ29sbGVjdGFibGU+IGV4dGVuZHMgbmV2ZXIgPyBSZWNvcmQ8bmV2ZXIsIG5ldmVyPlxuICAgICAgICA6IFJlY3Vyc2l2ZVJlcXVpcmVkPFxuICAgICAgICAgIE1hcFR5cGVzPEV4dHJhY3Q8VEFyZ05hbWVzLCBUQ29sbGVjdGFibGU+LCBBcnJheTxUVHlwZT4sIFROZWdhdGFibGU+XG4gICAgICAgID4pXG4gICAgOiBNYXBUeXBlczxUQXJnTmFtZXMsIFRUeXBlLCBUTmVnYXRhYmxlPlxuPjtcblxuLyoqIFNhbWUgYXMgYFJlY29yZGAgYnV0IGFsc28gc3VwcG9ydHMgZG90dGVkIGFuZCBuZWdhdGFibGUgb3B0aW9ucy4gKi9cbnR5cGUgTWFwVHlwZXM8XG4gIFRBcmdOYW1lcyBleHRlbmRzIEFyZ1R5cGUsXG4gIFRUeXBlLFxuICBUTmVnYXRhYmxlIGV4dGVuZHMgTmVnYXRhYmxlID0gdW5kZWZpbmVkLFxuPiA9IHVuZGVmaW5lZCBleHRlbmRzIFRBcmdOYW1lcyA/IFJlY29yZDxuZXZlciwgbmV2ZXI+XG4gIDogVEFyZ05hbWVzIGV4dGVuZHMgYCR7aW5mZXIgTmFtZX0uJHtpbmZlciBSZXN0fWAgPyB7XG4gICAgICBbS2V5IGluIE5hbWVdPzogTWFwVHlwZXM8XG4gICAgICAgIFJlc3QsXG4gICAgICAgIFRUeXBlLFxuICAgICAgICBUTmVnYXRhYmxlIGV4dGVuZHMgYCR7TmFtZX0uJHtpbmZlciBOZWdhdGV9YCA/IE5lZ2F0ZSA6IHVuZGVmaW5lZFxuICAgICAgPjtcbiAgICB9XG4gIDogVEFyZ05hbWVzIGV4dGVuZHMgc3RyaW5nID8gUGFydGlhbDxcbiAgICAgIFJlY29yZDxUQXJnTmFtZXMsIFROZWdhdGFibGUgZXh0ZW5kcyBUQXJnTmFtZXMgPyBUVHlwZSB8IGZhbHNlIDogVFR5cGU+XG4gICAgPlxuICA6IFJlY29yZDxuZXZlciwgbmV2ZXI+O1xuXG50eXBlIENvbGxlY3RVbmtub3duVmFsdWVzPFxuICBUQm9vbGVhbnMgZXh0ZW5kcyBCb29sZWFuVHlwZSxcbiAgVFN0cmluZ3MgZXh0ZW5kcyBTdHJpbmdUeXBlLFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBDb2xsZWN0YWJsZSxcbiAgVE5lZ2F0YWJsZSBleHRlbmRzIE5lZ2F0YWJsZSxcbj4gPSBVbmlvblRvSW50ZXJzZWN0aW9uPFxuICBUQ29sbGVjdGFibGUgZXh0ZW5kcyBUQm9vbGVhbnMgJiBUU3RyaW5ncyA/IFJlY29yZDxuZXZlciwgbmV2ZXI+XG4gICAgOiBEZWRvdFJlY29yZDxcbiAgICAgIC8vIFVua25vd24gY29sbGVjdGFibGUgJiBub24tbmVnYXRhYmxlIGFyZ3MuXG4gICAgICAmIFJlY29yZDxcbiAgICAgICAgRXhjbHVkZTxcbiAgICAgICAgICBFeHRyYWN0PEV4Y2x1ZGU8VENvbGxlY3RhYmxlLCBUTmVnYXRhYmxlPiwgc3RyaW5nPixcbiAgICAgICAgICBFeHRyYWN0PFRTdHJpbmdzIHwgVEJvb2xlYW5zLCBzdHJpbmc+XG4gICAgICAgID4sXG4gICAgICAgIEFycmF5PHVua25vd24+XG4gICAgICA+XG4gICAgICAvLyBVbmtub3duIGNvbGxlY3RhYmxlICYgbmVnYXRhYmxlIGFyZ3MuXG4gICAgICAmIFJlY29yZDxcbiAgICAgICAgRXhjbHVkZTxcbiAgICAgICAgICBFeHRyYWN0PEV4dHJhY3Q8VENvbGxlY3RhYmxlLCBUTmVnYXRhYmxlPiwgc3RyaW5nPixcbiAgICAgICAgICBFeHRyYWN0PFRTdHJpbmdzIHwgVEJvb2xlYW5zLCBzdHJpbmc+XG4gICAgICAgID4sXG4gICAgICAgIEFycmF5PHVua25vd24+IHwgZmFsc2VcbiAgICAgID5cbiAgICA+XG4+O1xuXG4vKiogQ29udmVydHMgYHsgXCJmb28uYmFyLmJhelwiOiB1bmtub3duIH1gIGludG8gYHsgZm9vOiB7IGJhcjogeyBiYXo6IHVua25vd24gfSB9IH1gLiAqL1xudHlwZSBEZWRvdFJlY29yZDxUUmVjb3JkPiA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+IGV4dGVuZHMgVFJlY29yZCA/IFRSZWNvcmRcbiAgOiBUUmVjb3JkIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPyBVbmlvblRvSW50ZXJzZWN0aW9uPFxuICAgICAgVmFsdWVPZjxcbiAgICAgICAge1xuICAgICAgICAgIFtLZXkgaW4ga2V5b2YgVFJlY29yZF06IEtleSBleHRlbmRzIHN0cmluZyA/IERlZG90PEtleSwgVFJlY29yZFtLZXldPlxuICAgICAgICAgICAgOiBuZXZlcjtcbiAgICAgICAgfVxuICAgICAgPlxuICAgID5cbiAgOiBUUmVjb3JkO1xuXG50eXBlIERlZG90PFRLZXkgZXh0ZW5kcyBzdHJpbmcsIFRWYWx1ZT4gPSBUS2V5IGV4dGVuZHNcbiAgYCR7aW5mZXIgTmFtZX0uJHtpbmZlciBSZXN0fWAgPyB7IFtLZXkgaW4gTmFtZV06IERlZG90PFJlc3QsIFRWYWx1ZT4gfVxuICA6IHsgW0tleSBpbiBUS2V5XTogVFZhbHVlIH07XG5cbnR5cGUgVmFsdWVPZjxUVmFsdWU+ID0gVFZhbHVlW2tleW9mIFRWYWx1ZV07XG5cbi8qKlxuICogVGhlIHZhbHVlIHJldHVybmVkIGZyb20gYHBhcnNlYC5cbiAqXG4gKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGluIDEuMC4wKSBJbXBvcnQgZnJvbVxuICoge0BsaW5rIGh0dHBzOi8vZGVuby5sYW5kL3N0ZC9jbGkvcGFyc2VfYXJncy50c30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJnczxcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgVEFyZ3MgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIFREb3VibGVEYXNoIGV4dGVuZHMgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbj4gPSBJZDxcbiAgJiBUQXJnc1xuICAmIHtcbiAgICAvKiogQ29udGFpbnMgYWxsIHRoZSBhcmd1bWVudHMgdGhhdCBkaWRuJ3QgaGF2ZSBhbiBvcHRpb24gYXNzb2NpYXRlZCB3aXRoXG4gICAgICogdGhlbS4gKi9cbiAgICBfOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+O1xuICB9XG4gICYgKGJvb2xlYW4gZXh0ZW5kcyBURG91YmxlRGFzaCA/IERvdWJsZURhc2hcbiAgICA6IHRydWUgZXh0ZW5kcyBURG91YmxlRGFzaCA/IFJlcXVpcmVkPERvdWJsZURhc2g+XG4gICAgOiBSZWNvcmQ8bmV2ZXIsIG5ldmVyPilcbj47XG5cbnR5cGUgRG91YmxlRGFzaCA9IHtcbiAgLyoqIENvbnRhaW5zIGFsbCB0aGUgYXJndW1lbnRzIHRoYXQgYXBwZWFyIGFmdGVyIHRoZSBkb3VibGUgZGFzaDogXCItLVwiLiAqL1xuICBcIi0tXCI/OiBBcnJheTxzdHJpbmc+O1xufTtcblxuLyoqXG4gKiBUaGUgb3B0aW9ucyBmb3IgdGhlIGBwYXJzZWAgY2FsbC5cbiAqXG4gKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGluIDEuMC4wKSBJbXBvcnQgZnJvbVxuICoge0BsaW5rIGh0dHBzOi8vZGVuby5sYW5kL3N0ZC9jbGkvcGFyc2VfYXJncy50c30gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZU9wdGlvbnM8XG4gIFRCb29sZWFucyBleHRlbmRzIEJvb2xlYW5UeXBlID0gQm9vbGVhblR5cGUsXG4gIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZSA9IFN0cmluZ1R5cGUsXG4gIFRDb2xsZWN0YWJsZSBleHRlbmRzIENvbGxlY3RhYmxlID0gQ29sbGVjdGFibGUsXG4gIFROZWdhdGFibGUgZXh0ZW5kcyBOZWdhdGFibGUgPSBOZWdhdGFibGUsXG4gIFREZWZhdWx0IGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQgPVxuICAgIHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgICB8IHVuZGVmaW5lZCxcbiAgVEFsaWFzZXMgZXh0ZW5kcyBBbGlhc2VzIHwgdW5kZWZpbmVkID0gQWxpYXNlcyB8IHVuZGVmaW5lZCxcbiAgVERvdWJsZURhc2ggZXh0ZW5kcyBib29sZWFuIHwgdW5kZWZpbmVkID0gYm9vbGVhbiB8IHVuZGVmaW5lZCxcbj4ge1xuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHBvcHVsYXRlIHRoZSByZXN1bHQgYF9gIHdpdGggZXZlcnl0aGluZyBiZWZvcmUgdGhlIGAtLWAgYW5kXG4gICAqIHRoZSByZXN1bHQgYFsnLS0nXWAgd2l0aCBldmVyeXRoaW5nIGFmdGVyIHRoZSBgLS1gLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7ZmFsc2V9XG4gICAqXG4gICAqICBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiAvLyAkIGRlbm8gcnVuIGV4YW1wbGUudHMgLS0gYSBhcmcxXG4gICAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZmxhZ3MvbW9kLnRzXCI7XG4gICAqIGNvbnNvbGUuZGlyKHBhcnNlKERlbm8uYXJncywgeyBcIi0tXCI6IGZhbHNlIH0pKTtcbiAgICogLy8gb3V0cHV0OiB7IF86IFsgXCJhXCIsIFwiYXJnMVwiIF0gfVxuICAgKiBjb25zb2xlLmRpcihwYXJzZShEZW5vLmFyZ3MsIHsgXCItLVwiOiB0cnVlIH0pKTtcbiAgICogLy8gb3V0cHV0OiB7IF86IFtdLCAtLTogWyBcImFcIiwgXCJhcmcxXCIgXSB9XG4gICAqIGBgYFxuICAgKi9cbiAgXCItLVwiPzogVERvdWJsZURhc2g7XG5cbiAgLyoqXG4gICAqIEFuIG9iamVjdCBtYXBwaW5nIHN0cmluZyBuYW1lcyB0byBzdHJpbmdzIG9yIGFycmF5cyBvZiBzdHJpbmcgYXJndW1lbnRcbiAgICogbmFtZXMgdG8gdXNlIGFzIGFsaWFzZXMuXG4gICAqL1xuICBhbGlhcz86IFRBbGlhc2VzO1xuXG4gIC8qKlxuICAgKiBBIGJvb2xlYW4sIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIHRvIGFsd2F5cyB0cmVhdCBhcyBib29sZWFucy4gSWZcbiAgICogYHRydWVgIHdpbGwgdHJlYXQgYWxsIGRvdWJsZSBoeXBoZW5hdGVkIGFyZ3VtZW50cyB3aXRob3V0IGVxdWFsIHNpZ25zIGFzXG4gICAqIGBib29sZWFuYCAoZS5nLiBhZmZlY3RzIGAtLWZvb2AsIG5vdCBgLWZgIG9yIGAtLWZvbz1iYXJgKS5cbiAgICogIEFsbCBgYm9vbGVhbmAgYXJndW1lbnRzIHdpbGwgYmUgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAgICovXG4gIGJvb2xlYW4/OiBUQm9vbGVhbnMgfCBSZWFkb25seUFycmF5PEV4dHJhY3Q8VEJvb2xlYW5zLCBzdHJpbmc+PjtcblxuICAvKiogQW4gb2JqZWN0IG1hcHBpbmcgc3RyaW5nIGFyZ3VtZW50IG5hbWVzIHRvIGRlZmF1bHQgdmFsdWVzLiAqL1xuICBkZWZhdWx0PzogVERlZmF1bHQgJiBEZWZhdWx0czxUQm9vbGVhbnMsIFRTdHJpbmdzPjtcblxuICAvKipcbiAgICogV2hlbiBgdHJ1ZWAsIHBvcHVsYXRlIHRoZSByZXN1bHQgYF9gIHdpdGggZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3RcbiAgICogbm9uLW9wdGlvbi5cbiAgICovXG4gIHN0b3BFYXJseT86IGJvb2xlYW47XG5cbiAgLyoqIEEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgYXJndW1lbnQgbmFtZXMgdG8gYWx3YXlzIHRyZWF0IGFzIHN0cmluZ3MuICovXG4gIHN0cmluZz86IFRTdHJpbmdzIHwgUmVhZG9ubHlBcnJheTxFeHRyYWN0PFRTdHJpbmdzLCBzdHJpbmc+PjtcblxuICAvKipcbiAgICogQSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBhcmd1bWVudCBuYW1lcyB0byBhbHdheXMgdHJlYXQgYXMgYXJyYXlzLlxuICAgKiBDb2xsZWN0YWJsZSBvcHRpb25zIGNhbiBiZSB1c2VkIG11bHRpcGxlIHRpbWVzLiBBbGwgdmFsdWVzIHdpbGwgYmVcbiAgICogY29sbGVjdGVkIGludG8gb25lIGFycmF5LiBJZiBhIG5vbi1jb2xsZWN0YWJsZSBvcHRpb24gaXMgdXNlZCBtdWx0aXBsZVxuICAgKiB0aW1lcywgdGhlIGxhc3QgdmFsdWUgaXMgdXNlZC5cbiAgICogQWxsIENvbGxlY3RhYmxlIGFyZ3VtZW50cyB3aWxsIGJlIHNldCB0byBgW11gIGJ5IGRlZmF1bHQuXG4gICAqL1xuICBjb2xsZWN0PzogVENvbGxlY3RhYmxlIHwgUmVhZG9ubHlBcnJheTxFeHRyYWN0PFRDb2xsZWN0YWJsZSwgc3RyaW5nPj47XG5cbiAgLyoqXG4gICAqIEEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgYXJndW1lbnQgbmFtZXMgd2hpY2ggY2FuIGJlIG5lZ2F0ZWRcbiAgICogYnkgcHJlZml4aW5nIHRoZW0gd2l0aCBgLS1uby1gLCBsaWtlIGAtLW5vLWNvbmZpZ2AuXG4gICAqL1xuICBuZWdhdGFibGU/OiBUTmVnYXRhYmxlIHwgUmVhZG9ubHlBcnJheTxFeHRyYWN0PFROZWdhdGFibGUsIHN0cmluZz4+O1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHdoaWNoIGlzIGludm9rZWQgd2l0aCBhIGNvbW1hbmQgbGluZSBwYXJhbWV0ZXIgbm90IGRlZmluZWQgaW5cbiAgICogdGhlIGBvcHRpb25zYCBjb25maWd1cmF0aW9uIG9iamVjdC4gSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgYGZhbHNlYCwgdGhlXG4gICAqIHVua25vd24gb3B0aW9uIGlzIG5vdCBhZGRlZCB0byBgcGFyc2VkQXJnc2AuXG4gICAqL1xuICB1bmtub3duPzogKGFyZzogc3RyaW5nLCBrZXk/OiBzdHJpbmcsIHZhbHVlPzogdW5rbm93bikgPT4gdW5rbm93bjtcbn1cblxuaW50ZXJmYWNlIEZsYWdzIHtcbiAgYm9vbHM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuICBzdHJpbmdzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcbiAgY29sbGVjdDogUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG4gIG5lZ2F0YWJsZTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG4gIHVua25vd25GbjogKGFyZzogc3RyaW5nLCBrZXk/OiBzdHJpbmcsIHZhbHVlPzogdW5rbm93bikgPT4gdW5rbm93bjtcbiAgYWxsQm9vbHM6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBOZXN0ZWRNYXBwaW5nIHtcbiAgW2tleTogc3RyaW5nXTogTmVzdGVkTWFwcGluZyB8IHVua25vd247XG59XG5cbmNvbnN0IHsgaGFzT3duIH0gPSBPYmplY3Q7XG5cbmZ1bmN0aW9uIGdldDxUVmFsdWU+KFxuICBvYmo6IFJlY29yZDxzdHJpbmcsIFRWYWx1ZT4sXG4gIGtleTogc3RyaW5nLFxuKTogVFZhbHVlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGhhc093bihvYmosIGtleSkpIHtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9yY2U8VFZhbHVlPihvYmo6IFJlY29yZDxzdHJpbmcsIFRWYWx1ZT4sIGtleTogc3RyaW5nKTogVFZhbHVlIHtcbiAgY29uc3QgdiA9IGdldChvYmosIGtleSk7XG4gIGFzc2VydEV4aXN0cyh2KTtcbiAgcmV0dXJuIHY7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKHg6IHVua25vd24pOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiB4ID09PSBcIm51bWJlclwiKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKC9eMHhbMC05YS1mXSskL2kudGVzdChTdHJpbmcoeCkpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIC9eWy0rXT8oPzpcXGQrKD86XFwuXFxkKik/fFxcLlxcZCspKGVbLStdP1xcZCspPyQvLnRlc3QoU3RyaW5nKHgpKTtcbn1cblxuZnVuY3Rpb24gaGFzS2V5KG9iajogTmVzdGVkTWFwcGluZywga2V5czogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgbGV0IG8gPSBvYmo7XG4gIGtleXMuc2xpY2UoMCwgLTEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIG8gPSAoZ2V0KG8sIGtleSkgPz8ge30pIGFzIE5lc3RlZE1hcHBpbmc7XG4gIH0pO1xuXG4gIGNvbnN0IGtleSA9IGtleXMuYXQoLTEpO1xuICByZXR1cm4ga2V5ICE9PSB1bmRlZmluZWQgJiYgaGFzT3duKG8sIGtleSk7XG59XG5cbi8qKlxuICogVGFrZSBhIHNldCBvZiBjb21tYW5kIGxpbmUgYXJndW1lbnRzLCBvcHRpb25hbGx5IHdpdGggYSBzZXQgb2Ygb3B0aW9ucywgYW5kXG4gKiByZXR1cm4gYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZmxhZ3MgZm91bmQgaW4gdGhlIHBhc3NlZCBhcmd1bWVudHMuXG4gKlxuICogQnkgZGVmYXVsdCwgYW55IGFyZ3VtZW50cyBzdGFydGluZyB3aXRoIGAtYCBvciBgLS1gIGFyZSBjb25zaWRlcmVkIGJvb2xlYW5cbiAqIGZsYWdzLiBJZiB0aGUgYXJndW1lbnQgbmFtZSBpcyBmb2xsb3dlZCBieSBhbiBlcXVhbCBzaWduIChgPWApIGl0IGlzXG4gKiBjb25zaWRlcmVkIGEga2V5LXZhbHVlIHBhaXIuIEFueSBhcmd1bWVudHMgd2hpY2ggY291bGQgbm90IGJlIHBhcnNlZCBhcmVcbiAqIGF2YWlsYWJsZSBpbiB0aGUgYF9gIHByb3BlcnR5IG9mIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gKlxuICogQnkgZGVmYXVsdCwgdGhlIGZsYWdzIG1vZHVsZSB0cmllcyB0byBkZXRlcm1pbmUgdGhlIHR5cGUgb2YgYWxsIGFyZ3VtZW50c1xuICogYXV0b21hdGljYWxseSBhbmQgdGhlIHJldHVybiB0eXBlIG9mIHRoZSBgcGFyc2VgIG1ldGhvZCB3aWxsIGhhdmUgYW4gaW5kZXhcbiAqIHNpZ25hdHVyZSB3aXRoIGBhbnlgIGFzIHZhbHVlIChgeyBbeDogc3RyaW5nXTogYW55IH1gKS5cbiAqXG4gKiBJZiB0aGUgYHN0cmluZ2AsIGBib29sZWFuYCBvciBgY29sbGVjdGAgb3B0aW9uIGlzIHNldCwgdGhlIHJldHVybiB2YWx1ZSBvZlxuICogdGhlIGBwYXJzZWAgbWV0aG9kIHdpbGwgYmUgZnVsbHkgdHlwZWQgYW5kIHRoZSBpbmRleCBzaWduYXR1cmUgb2YgdGhlIHJldHVyblxuICogdHlwZSB3aWxsIGNoYW5nZSB0byBgeyBbeDogc3RyaW5nXTogdW5rbm93biB9YC5cbiAqXG4gKiBBbnkgYXJndW1lbnRzIGFmdGVyIGAnLS0nYCB3aWxsIG5vdCBiZSBwYXJzZWQgYW5kIHdpbGwgZW5kIHVwIGluIGBwYXJzZWRBcmdzLl9gLlxuICpcbiAqIE51bWVyaWMtbG9va2luZyBhcmd1bWVudHMgd2lsbCBiZSByZXR1cm5lZCBhcyBudW1iZXJzIHVubGVzcyBgb3B0aW9ucy5zdHJpbmdgXG4gKiBvciBgb3B0aW9ucy5ib29sZWFuYCBpcyBzZXQgZm9yIHRoYXQgYXJndW1lbnQgbmFtZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHBhcnNlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZmxhZ3MvbW9kLnRzXCI7XG4gKiBjb25zdCBwYXJzZWRBcmdzID0gcGFyc2UoRGVuby5hcmdzKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9mbGFncy9tb2QudHNcIjtcbiAqIGNvbnN0IHBhcnNlZEFyZ3MgPSBwYXJzZShbXCItLWZvb1wiLCBcIi0tYmFyPWJhelwiLCBcIi4vcXV1eC50eHRcIl0pO1xuICogLy8gcGFyc2VkQXJnczogeyBmb286IHRydWUsIGJhcjogXCJiYXpcIiwgXzogW1wiLi9xdXV4LnR4dFwiXSB9XG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCAod2lsbCBiZSByZW1vdmVkIGluIDEuMC4wKSBVc2VcbiAqIHtAbGlua2NvZGUgaHR0cHM6Ly9kZW5vLmxhbmQvc3RkL2NsaS9wYXJzZV9hcmdzLnRzP3M9cGFyc2VBcmdzIHwgcGFyc2VBcmdzfVxuICogaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlPFxuICBUQXJncyBleHRlbmRzIFZhbHVlczxcbiAgICBUQm9vbGVhbnMsXG4gICAgVFN0cmluZ3MsXG4gICAgVENvbGxlY3RhYmxlLFxuICAgIFROZWdhdGFibGUsXG4gICAgVERlZmF1bHRzLFxuICAgIFRBbGlhc2VzXG4gID4sXG4gIFREb3VibGVEYXNoIGV4dGVuZHMgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgVEJvb2xlYW5zIGV4dGVuZHMgQm9vbGVhblR5cGUgPSB1bmRlZmluZWQsXG4gIFRTdHJpbmdzIGV4dGVuZHMgU3RyaW5nVHlwZSA9IHVuZGVmaW5lZCxcbiAgVENvbGxlY3RhYmxlIGV4dGVuZHMgQ29sbGVjdGFibGUgPSB1bmRlZmluZWQsXG4gIFROZWdhdGFibGUgZXh0ZW5kcyBOZWdhdGFibGUgPSB1bmRlZmluZWQsXG4gIFREZWZhdWx0cyBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICBUQWxpYXNlcyBleHRlbmRzIEFsaWFzZXM8VEFsaWFzQXJnTmFtZXMsIFRBbGlhc05hbWVzPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbiAgVEFsaWFzQXJnTmFtZXMgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmcsXG4gIFRBbGlhc05hbWVzIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nLFxuPihcbiAgYXJnczogc3RyaW5nW10sXG4gIHtcbiAgICBcIi0tXCI6IGRvdWJsZURhc2ggPSBmYWxzZSxcbiAgICBhbGlhcyA9IHt9IGFzIE5vbk51bGxhYmxlPFRBbGlhc2VzPixcbiAgICBib29sZWFuID0gZmFsc2UsXG4gICAgZGVmYXVsdDogZGVmYXVsdHMgPSB7fSBhcyBURGVmYXVsdHMgJiBEZWZhdWx0czxUQm9vbGVhbnMsIFRTdHJpbmdzPixcbiAgICBzdG9wRWFybHkgPSBmYWxzZSxcbiAgICBzdHJpbmcgPSBbXSxcbiAgICBjb2xsZWN0ID0gW10sXG4gICAgbmVnYXRhYmxlID0gW10sXG4gICAgdW5rbm93biA9IChpOiBzdHJpbmcpOiB1bmtub3duID0+IGksXG4gIH06IFBhcnNlT3B0aW9uczxcbiAgICBUQm9vbGVhbnMsXG4gICAgVFN0cmluZ3MsXG4gICAgVENvbGxlY3RhYmxlLFxuICAgIFROZWdhdGFibGUsXG4gICAgVERlZmF1bHRzLFxuICAgIFRBbGlhc2VzLFxuICAgIFREb3VibGVEYXNoXG4gID4gPSB7fSxcbik6IEFyZ3M8VEFyZ3MsIFREb3VibGVEYXNoPiB7XG4gIGNvbnN0IGFsaWFzZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xuICBjb25zdCBmbGFnczogRmxhZ3MgPSB7XG4gICAgYm9vbHM6IHt9LFxuICAgIHN0cmluZ3M6IHt9LFxuICAgIHVua25vd25GbjogdW5rbm93bixcbiAgICBhbGxCb29sczogZmFsc2UsXG4gICAgY29sbGVjdDoge30sXG4gICAgbmVnYXRhYmxlOiB7fSxcbiAgfTtcblxuICBpZiAoYWxpYXMgIT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGFsaWFzKSB7XG4gICAgICBjb25zdCB2YWwgPSBnZXRGb3JjZShhbGlhcywga2V5KTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGFsaWFzZXNba2V5XSA9IFt2YWxdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxpYXNlc1trZXldID0gdmFsIGFzIEFycmF5PHN0cmluZz47XG4gICAgICB9XG4gICAgICBjb25zdCBhbGlhc2VzRm9yS2V5ID0gZ2V0Rm9yY2UoYWxpYXNlcywga2V5KTtcbiAgICAgIGZvciAoY29uc3QgYWxpYXMgb2YgYWxpYXNlc0ZvcktleSkge1xuICAgICAgICBhbGlhc2VzW2FsaWFzXSA9IFtrZXldLmNvbmNhdChhbGlhc2VzRm9yS2V5LmZpbHRlcigoeSkgPT4gYWxpYXMgIT09IHkpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoYm9vbGVhbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiBib29sZWFuID09PSBcImJvb2xlYW5cIikge1xuICAgICAgZmxhZ3MuYWxsQm9vbHMgPSAhIWJvb2xlYW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJvb2xlYW5BcmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4gPSB0eXBlb2YgYm9vbGVhbiA9PT0gXCJzdHJpbmdcIlxuICAgICAgICA/IFtib29sZWFuXVxuICAgICAgICA6IGJvb2xlYW47XG5cbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGJvb2xlYW5BcmdzLmZpbHRlcihCb29sZWFuKSkge1xuICAgICAgICBmbGFncy5ib29sc1trZXldID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgYWxpYXMgPSBnZXQoYWxpYXNlcywga2V5KTtcbiAgICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBhbCBvZiBhbGlhcykge1xuICAgICAgICAgICAgZmxhZ3MuYm9vbHNbYWxdID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoc3RyaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBzdHJpbmdBcmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4gPSB0eXBlb2Ygc3RyaW5nID09PSBcInN0cmluZ1wiXG4gICAgICA/IFtzdHJpbmddXG4gICAgICA6IHN0cmluZztcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIHN0cmluZ0FyZ3MuZmlsdGVyKEJvb2xlYW4pKSB7XG4gICAgICBmbGFncy5zdHJpbmdzW2tleV0gPSB0cnVlO1xuICAgICAgY29uc3QgYWxpYXMgPSBnZXQoYWxpYXNlcywga2V5KTtcbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICBmb3IgKGNvbnN0IGFsIG9mIGFsaWFzKSB7XG4gICAgICAgICAgZmxhZ3Muc3RyaW5nc1thbF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbGxlY3QgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGNvbGxlY3RBcmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4gPSB0eXBlb2YgY29sbGVjdCA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBbY29sbGVjdF1cbiAgICAgIDogY29sbGVjdDtcblxuICAgIGZvciAoY29uc3Qga2V5IG9mIGNvbGxlY3RBcmdzLmZpbHRlcihCb29sZWFuKSkge1xuICAgICAgZmxhZ3MuY29sbGVjdFtrZXldID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGFsaWFzID0gZ2V0KGFsaWFzZXMsIGtleSk7XG4gICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBhbCBvZiBhbGlhcykge1xuICAgICAgICAgIGZsYWdzLmNvbGxlY3RbYWxdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChuZWdhdGFibGUgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IG5lZ2F0YWJsZUFyZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiA9IHR5cGVvZiBuZWdhdGFibGUgPT09IFwic3RyaW5nXCJcbiAgICAgID8gW25lZ2F0YWJsZV1cbiAgICAgIDogbmVnYXRhYmxlO1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgbmVnYXRhYmxlQXJncy5maWx0ZXIoQm9vbGVhbikpIHtcbiAgICAgIGZsYWdzLm5lZ2F0YWJsZVtrZXldID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGFsaWFzID0gZ2V0KGFsaWFzZXMsIGtleSk7XG4gICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBhbCBvZiBhbGlhcykge1xuICAgICAgICAgIGZsYWdzLm5lZ2F0YWJsZVthbF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYXJndjogQXJncyA9IHsgXzogW10gfTtcblxuICBmdW5jdGlvbiBhcmdEZWZpbmVkKGtleTogc3RyaW5nLCBhcmc6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAoZmxhZ3MuYWxsQm9vbHMgJiYgL14tLVtePV0rJC8udGVzdChhcmcpKSB8fFxuICAgICAgZ2V0KGZsYWdzLmJvb2xzLCBrZXkpIHx8XG4gICAgICAhIWdldChmbGFncy5zdHJpbmdzLCBrZXkpIHx8XG4gICAgICAhIWdldChhbGlhc2VzLCBrZXkpXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEtleShcbiAgICBvYmo6IE5lc3RlZE1hcHBpbmcsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiB1bmtub3duLFxuICAgIGNvbGxlY3QgPSB0cnVlLFxuICApIHtcbiAgICBsZXQgbyA9IG9iajtcbiAgICBjb25zdCBrZXlzID0gbmFtZS5zcGxpdChcIi5cIik7XG4gICAga2V5cy5zbGljZSgwLCAtMSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoZ2V0KG8sIGtleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvW2tleV0gPSB7fTtcbiAgICAgIH1cbiAgICAgIG8gPSBnZXQobywga2V5KSBhcyBOZXN0ZWRNYXBwaW5nO1xuICAgIH0pO1xuXG4gICAgY29uc3Qga2V5ID0ga2V5cy5hdCgtMSkhO1xuICAgIGNvbnN0IGNvbGxlY3RhYmxlID0gY29sbGVjdCAmJiAhIWdldChmbGFncy5jb2xsZWN0LCBuYW1lKTtcblxuICAgIGlmICghY29sbGVjdGFibGUpIHtcbiAgICAgIG9ba2V5XSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAoZ2V0KG8sIGtleSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgb1trZXldID0gW3ZhbHVlXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZ2V0KG8sIGtleSkpKSB7XG4gICAgICAob1trZXldIGFzIHVua25vd25bXSkucHVzaCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ba2V5XSA9IFtnZXQobywga2V5KSwgdmFsdWVdO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEFyZyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWw6IHVua25vd24sXG4gICAgYXJnOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQsXG4gICAgY29sbGVjdD86IGJvb2xlYW4sXG4gICkge1xuICAgIGlmIChhcmcgJiYgZmxhZ3MudW5rbm93bkZuICYmICFhcmdEZWZpbmVkKGtleSwgYXJnKSkge1xuICAgICAgaWYgKGZsYWdzLnVua25vd25GbihhcmcsIGtleSwgdmFsKSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZSA9ICFnZXQoZmxhZ3Muc3RyaW5ncywga2V5KSAmJiBpc051bWJlcih2YWwpID8gTnVtYmVyKHZhbCkgOiB2YWw7XG4gICAgc2V0S2V5KGFyZ3YsIGtleSwgdmFsdWUsIGNvbGxlY3QpO1xuXG4gICAgY29uc3QgYWxpYXMgPSBnZXQoYWxpYXNlcywga2V5KTtcbiAgICBpZiAoYWxpYXMpIHtcbiAgICAgIGZvciAoY29uc3QgeCBvZiBhbGlhcykge1xuICAgICAgICBzZXRLZXkoYXJndiwgeCwgdmFsdWUsIGNvbGxlY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFsaWFzSXNCb29sZWFuKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldEZvcmNlKGFsaWFzZXMsIGtleSkuc29tZShcbiAgICAgICh4KSA9PiB0eXBlb2YgZ2V0KGZsYWdzLmJvb2xzLCB4KSA9PT0gXCJib29sZWFuXCIsXG4gICAgKTtcbiAgfVxuXG4gIGxldCBub3RGbGFnczogc3RyaW5nW10gPSBbXTtcblxuICAvLyBhbGwgYXJncyBhZnRlciBcIi0tXCIgYXJlIG5vdCBwYXJzZWRcbiAgaWYgKGFyZ3MuaW5jbHVkZXMoXCItLVwiKSkge1xuICAgIG5vdEZsYWdzID0gYXJncy5zbGljZShhcmdzLmluZGV4T2YoXCItLVwiKSArIDEpO1xuICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDAsIGFyZ3MuaW5kZXhPZihcIi0tXCIpKTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGFyZyA9IGFyZ3NbaV07XG4gICAgYXNzZXJ0RXhpc3RzKGFyZyk7XG5cbiAgICBpZiAoL14tLS4rPS8udGVzdChhcmcpKSB7XG4gICAgICBjb25zdCBtID0gYXJnLm1hdGNoKC9eLS0oW149XSspPSguKikkL3MpO1xuICAgICAgYXNzZXJ0RXhpc3RzKG0pO1xuICAgICAgY29uc3QgWywga2V5LCB2YWx1ZV0gPSBtO1xuICAgICAgYXNzZXJ0RXhpc3RzKGtleSk7XG5cbiAgICAgIGlmIChmbGFncy5ib29sc1trZXldKSB7XG4gICAgICAgIGNvbnN0IGJvb2xlYW5WYWx1ZSA9IHZhbHVlICE9PSBcImZhbHNlXCI7XG4gICAgICAgIHNldEFyZyhrZXksIGJvb2xlYW5WYWx1ZSwgYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEFyZyhrZXksIHZhbHVlLCBhcmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICAvXi0tbm8tLisvLnRlc3QoYXJnKSAmJiBnZXQoZmxhZ3MubmVnYXRhYmxlLCBhcmcucmVwbGFjZSgvXi0tbm8tLywgXCJcIikpXG4gICAgKSB7XG4gICAgICBjb25zdCBtID0gYXJnLm1hdGNoKC9eLS1uby0oLispLyk7XG4gICAgICBhc3NlcnRFeGlzdHMobSk7XG4gICAgICBhc3NlcnRFeGlzdHMobVsxXSk7XG4gICAgICBzZXRBcmcobVsxXSwgZmFsc2UsIGFyZywgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoL14tLS4rLy50ZXN0KGFyZykpIHtcbiAgICAgIGNvbnN0IG0gPSBhcmcubWF0Y2goL14tLSguKykvKTtcbiAgICAgIGFzc2VydEV4aXN0cyhtKTtcbiAgICAgIGFzc2VydEV4aXN0cyhtWzFdKTtcbiAgICAgIGNvbnN0IFssIGtleV0gPSBtO1xuICAgICAgY29uc3QgbmV4dCA9IGFyZ3NbaSArIDFdO1xuICAgICAgaWYgKFxuICAgICAgICBuZXh0ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgIS9eLS8udGVzdChuZXh0KSAmJlxuICAgICAgICAhZ2V0KGZsYWdzLmJvb2xzLCBrZXkpICYmXG4gICAgICAgICFmbGFncy5hbGxCb29scyAmJlxuICAgICAgICAoZ2V0KGFsaWFzZXMsIGtleSkgPyAhYWxpYXNJc0Jvb2xlYW4oa2V5KSA6IHRydWUpXG4gICAgICApIHtcbiAgICAgICAgc2V0QXJnKGtleSwgbmV4dCwgYXJnKTtcbiAgICAgICAgaSsrO1xuICAgICAgfSBlbHNlIGlmIChuZXh0ICE9PSB1bmRlZmluZWQgJiYgKG5leHQgPT09IFwidHJ1ZVwiIHx8IG5leHQgPT09IFwiZmFsc2VcIikpIHtcbiAgICAgICAgc2V0QXJnKGtleSwgbmV4dCA9PT0gXCJ0cnVlXCIsIGFyZyk7XG4gICAgICAgIGkrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEFyZyhrZXksIGdldChmbGFncy5zdHJpbmdzLCBrZXkpID8gXCJcIiA6IHRydWUsIGFyZyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgvXi1bXi1dKy8udGVzdChhcmcpKSB7XG4gICAgICBjb25zdCBsZXR0ZXJzID0gYXJnLnNsaWNlKDEsIC0xKS5zcGxpdChcIlwiKTtcblxuICAgICAgbGV0IGJyb2tlbiA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBbaiwgbGV0dGVyXSBvZiBsZXR0ZXJzLmVudHJpZXMoKSkge1xuICAgICAgICBjb25zdCBuZXh0ID0gYXJnLnNsaWNlKGogKyAyKTtcblxuICAgICAgICBpZiAobmV4dCA9PT0gXCItXCIpIHtcbiAgICAgICAgICBzZXRBcmcobGV0dGVyLCBuZXh0LCBhcmcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKC9bQS1aYS16XS8udGVzdChsZXR0ZXIpICYmIG5leHQuaW5jbHVkZXMoXCI9XCIpKSB7XG4gICAgICAgICAgc2V0QXJnKGxldHRlciwgbmV4dC5zcGxpdCgvPSguKykvKVsxXSwgYXJnKTtcbiAgICAgICAgICBicm9rZW4gPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIC9bQS1aYS16XS8udGVzdChsZXR0ZXIpICYmXG4gICAgICAgICAgLy0/XFxkKyhcXC5cXGQqKT8oZS0/XFxkKyk/JC8udGVzdChuZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBzZXRBcmcobGV0dGVyLCBuZXh0LCBhcmcpO1xuICAgICAgICAgIGJyb2tlbiA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGV0dGVyc1tqICsgMV0/Lm1hdGNoKC9cXFcvKSkge1xuICAgICAgICAgIHNldEFyZyhsZXR0ZXIsIGFyZy5zbGljZShqICsgMiksIGFyZyk7XG4gICAgICAgICAgYnJva2VuID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRBcmcobGV0dGVyLCBnZXQoZmxhZ3Muc3RyaW5ncywgbGV0dGVyKSA/IFwiXCIgOiB0cnVlLCBhcmcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGtleSA9IGFyZy5hdCgtMSkhO1xuICAgICAgaWYgKCFicm9rZW4gJiYga2V5ICE9PSBcIi1cIikge1xuICAgICAgICBjb25zdCBuZXh0QXJnID0gYXJnc1tpICsgMV07XG4gICAgICAgIGlmIChcbiAgICAgICAgICBuZXh0QXJnICYmXG4gICAgICAgICAgIS9eKC18LS0pW14tXS8udGVzdChuZXh0QXJnKSAmJlxuICAgICAgICAgICFnZXQoZmxhZ3MuYm9vbHMsIGtleSkgJiZcbiAgICAgICAgICAoZ2V0KGFsaWFzZXMsIGtleSkgPyAhYWxpYXNJc0Jvb2xlYW4oa2V5KSA6IHRydWUpXG4gICAgICAgICkge1xuICAgICAgICAgIHNldEFyZyhrZXksIG5leHRBcmcsIGFyZyk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHRBcmcgJiYgKG5leHRBcmcgPT09IFwidHJ1ZVwiIHx8IG5leHRBcmcgPT09IFwiZmFsc2VcIikpIHtcbiAgICAgICAgICBzZXRBcmcoa2V5LCBuZXh0QXJnID09PSBcInRydWVcIiwgYXJnKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0QXJnKGtleSwgZ2V0KGZsYWdzLnN0cmluZ3MsIGtleSkgPyBcIlwiIDogdHJ1ZSwgYXJnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWZsYWdzLnVua25vd25GbiB8fCBmbGFncy51bmtub3duRm4oYXJnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgYXJndi5fLnB1c2goZmxhZ3Muc3RyaW5nc1tcIl9cIl0gPz8gIWlzTnVtYmVyKGFyZykgPyBhcmcgOiBOdW1iZXIoYXJnKSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RvcEVhcmx5KSB7XG4gICAgICAgIGFyZ3YuXy5wdXNoKC4uLmFyZ3Muc2xpY2UoaSArIDEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZGVmYXVsdHMpKSB7XG4gICAgaWYgKCFoYXNLZXkoYXJndiwga2V5LnNwbGl0KFwiLlwiKSkpIHtcbiAgICAgIHNldEtleShhcmd2LCBrZXksIHZhbHVlLCBmYWxzZSk7XG5cbiAgICAgIGNvbnN0IGFsaWFzID0gYWxpYXNlc1trZXldO1xuICAgICAgaWYgKGFsaWFzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yIChjb25zdCB4IG9mIGFsaWFzKSB7XG4gICAgICAgICAgc2V0S2V5KGFyZ3YsIHgsIHZhbHVlLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhmbGFncy5ib29scykpIHtcbiAgICBpZiAoIWhhc0tleShhcmd2LCBrZXkuc3BsaXQoXCIuXCIpKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBnZXQoZmxhZ3MuY29sbGVjdCwga2V5KSA/IFtdIDogZmFsc2U7XG4gICAgICBzZXRLZXkoXG4gICAgICAgIGFyZ3YsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGZhbHNlLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhmbGFncy5zdHJpbmdzKSkge1xuICAgIGlmICghaGFzS2V5KGFyZ3YsIGtleS5zcGxpdChcIi5cIikpICYmIGdldChmbGFncy5jb2xsZWN0LCBrZXkpKSB7XG4gICAgICBzZXRLZXkoXG4gICAgICAgIGFyZ3YsXG4gICAgICAgIGtleSxcbiAgICAgICAgW10sXG4gICAgICAgIGZhbHNlLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZG91YmxlRGFzaCkge1xuICAgIGFyZ3ZbXCItLVwiXSA9IFtdO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIG5vdEZsYWdzKSB7XG4gICAgICBhcmd2W1wiLS1cIl0ucHVzaChrZXkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBub3RGbGFncykge1xuICAgICAgYXJndi5fLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXJndiBhcyBBcmdzPFRBcmdzLCBURG91YmxlRGFzaD47XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQkMsR0FDRCxTQUFTLFlBQVksUUFBUSw2QkFBNkI7QUFnVjFELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRztBQUVuQixTQUFTLElBQ1AsR0FBMkIsRUFDM0IsR0FBVztFQUVYLElBQUksT0FBTyxLQUFLLE1BQU07SUFDcEIsT0FBTyxHQUFHLENBQUMsSUFBSTtFQUNqQjtBQUNGO0FBRUEsU0FBUyxTQUFpQixHQUEyQixFQUFFLEdBQVc7RUFDaEUsTUFBTSxJQUFJLElBQUksS0FBSztFQUNuQixhQUFhO0VBQ2IsT0FBTztBQUNUO0FBRUEs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
// denoCacheMetadata=2967985736842028903,2800376186667405354
