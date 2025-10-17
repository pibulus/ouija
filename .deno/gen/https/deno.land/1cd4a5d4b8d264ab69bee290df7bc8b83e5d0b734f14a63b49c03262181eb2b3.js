import { greaterOrEqual, join, relative, semverParse, walk } from "./deps.ts";
export { generate } from "./manifest.ts";
import { generate } from "./manifest.ts";
import { error } from "./error.ts";
const MIN_DENO_VERSION = "1.31.0";
const TEST_FILE_PATTERN = /[._]test\.(?:[tj]sx?|[mc][tj]s)$/;
export function ensureMinDenoVersion() {
  // Check that the minimum supported Deno version is being used.
  if (
    !greaterOrEqual(
      semverParse(Deno.version.deno),
      semverParse(MIN_DENO_VERSION),
    )
  ) {
    let message =
      `Deno version ${MIN_DENO_VERSION} or higher is required. Please update Deno.\n\n`;
    if (Deno.execPath().includes("homebrew")) {
      message +=
        "You seem to have installed Deno via homebrew. To update, run: `brew upgrade deno`\n";
    } else {
      message += "To update, run: `deno upgrade`\n";
    }
    error(message);
  }
}
async function collectDir(
  dir,
  callback,
  ignoreFilePattern = TEST_FILE_PATTERN,
) {
  // Check if provided path is a directory
  try {
    const stat = await Deno.stat(dir);
    if (!stat.isDirectory) return;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return;
    throw err;
  }
  const routesFolder = walk(dir, {
    includeDirs: false,
    includeFiles: true,
    exts: [
      "tsx",
      "jsx",
      "ts",
      "js",
    ],
    skip: [
      ignoreFilePattern,
    ],
  });
  for await (const entry of routesFolder) {
    callback(entry, dir);
  }
}
const GROUP_REG = /[/\\\\]\((_[^/\\\\]+)\)[/\\\\]/;
export async function collect(directory, ignoreFilePattern) {
  const filePaths = new Set();
  const routes = [];
  const islands = [];
  await Promise.all([
    collectDir(join(directory, "./routes"), (entry, dir) => {
      const rel = join("routes", relative(dir, entry.path));
      const normalized = rel.slice(0, rel.lastIndexOf("."));
      // A `(_islands)` path segment is a local island folder.
      // Any route path segment wrapped in `(_...)` is ignored
      // during route collection.
      const match = normalized.match(GROUP_REG);
      if (match && match[1].startsWith("_")) {
        if (match[1] === "_islands") {
          islands.push(rel);
        }
        return;
      }
      if (filePaths.has(normalized)) {
        throw new Error(
          `Route conflict detected. Multiple files have the same name: ${dir}${normalized}`,
        );
      }
      filePaths.add(normalized);
      routes.push(rel);
    }, ignoreFilePattern),
    collectDir(join(directory, "./islands"), (entry, dir) => {
      const rel = join("islands", relative(dir, entry.path));
      islands.push(rel);
    }, ignoreFilePattern),
  ]);
  routes.sort();
  islands.sort();
  return {
    routes,
    islands,
  };
}
export async function manifest(path, ignoreFilePattern) {
  const manifest = await collect(path, ignoreFilePattern);
  await generate(path, manifest);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZnJlc2hAMS43LjMvc3JjL2Rldi9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZ3JlYXRlck9yRXF1YWwsXG4gIGpvaW4sXG4gIHJlbGF0aXZlLFxuICBzZW12ZXJQYXJzZSxcbiAgd2FsayxcbiAgV2Fsa0VudHJ5LFxufSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5leHBvcnQgeyBnZW5lcmF0ZSwgdHlwZSBNYW5pZmVzdCB9IGZyb20gXCIuL21hbmlmZXN0LnRzXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSwgdHlwZSBNYW5pZmVzdCB9IGZyb20gXCIuL21hbmlmZXN0LnRzXCI7XG5pbXBvcnQgeyBlcnJvciB9IGZyb20gXCIuL2Vycm9yLnRzXCI7XG5jb25zdCBNSU5fREVOT19WRVJTSU9OID0gXCIxLjMxLjBcIjtcbmNvbnN0IFRFU1RfRklMRV9QQVRURVJOID0gL1suX110ZXN0XFwuKD86W3RqXXN4P3xbbWNdW3RqXXMpJC87XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVNaW5EZW5vVmVyc2lvbigpIHtcbiAgLy8gQ2hlY2sgdGhhdCB0aGUgbWluaW11bSBzdXBwb3J0ZWQgRGVubyB2ZXJzaW9uIGlzIGJlaW5nIHVzZWQuXG4gIGlmIChcbiAgICAhZ3JlYXRlck9yRXF1YWwoXG4gICAgICBzZW12ZXJQYXJzZShEZW5vLnZlcnNpb24uZGVubyksXG4gICAgICBzZW12ZXJQYXJzZShNSU5fREVOT19WRVJTSU9OKSxcbiAgICApXG4gICkge1xuICAgIGxldCBtZXNzYWdlID1cbiAgICAgIGBEZW5vIHZlcnNpb24gJHtNSU5fREVOT19WRVJTSU9OfSBvciBoaWdoZXIgaXMgcmVxdWlyZWQuIFBsZWFzZSB1cGRhdGUgRGVuby5cXG5cXG5gO1xuXG4gICAgaWYgKERlbm8uZXhlY1BhdGgoKS5pbmNsdWRlcyhcImhvbWVicmV3XCIpKSB7XG4gICAgICBtZXNzYWdlICs9XG4gICAgICAgIFwiWW91IHNlZW0gdG8gaGF2ZSBpbnN0YWxsZWQgRGVubyB2aWEgaG9tZWJyZXcuIFRvIHVwZGF0ZSwgcnVuOiBgYnJldyB1cGdyYWRlIGRlbm9gXFxuXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgKz0gXCJUbyB1cGRhdGUsIHJ1bjogYGRlbm8gdXBncmFkZWBcXG5cIjtcbiAgICB9XG5cbiAgICBlcnJvcihtZXNzYWdlKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb2xsZWN0RGlyKFxuICBkaXI6IHN0cmluZyxcbiAgY2FsbGJhY2s6IChlbnRyeTogV2Fsa0VudHJ5LCBkaXI6IHN0cmluZykgPT4gdm9pZCxcbiAgaWdub3JlRmlsZVBhdHRlcm4gPSBURVNUX0ZJTEVfUEFUVEVSTixcbik6IFByb21pc2U8dm9pZD4ge1xuICAvLyBDaGVjayBpZiBwcm92aWRlZCBwYXRoIGlzIGEgZGlyZWN0b3J5XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdCA9IGF3YWl0IERlbm8uc3RhdChkaXIpO1xuICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSkgcmV0dXJuO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpIHJldHVybjtcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICBjb25zdCByb3V0ZXNGb2xkZXIgPSB3YWxrKGRpciwge1xuICAgIGluY2x1ZGVEaXJzOiBmYWxzZSxcbiAgICBpbmNsdWRlRmlsZXM6IHRydWUsXG4gICAgZXh0czogW1widHN4XCIsIFwianN4XCIsIFwidHNcIiwgXCJqc1wiXSxcbiAgICBza2lwOiBbaWdub3JlRmlsZVBhdHRlcm5dLFxuICB9KTtcblxuICBmb3IgYXdhaXQgKGNvbnN0IGVudHJ5IG9mIHJvdXRlc0ZvbGRlcikge1xuICAgIGNhbGxiYWNrKGVudHJ5LCBkaXIpO1xuICB9XG59XG5cbmNvbnN0IEdST1VQX1JFRyA9IC9bL1xcXFxcXFxcXVxcKChfW14vXFxcXFxcXFxdKylcXClbL1xcXFxcXFxcXS87XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29sbGVjdChcbiAgZGlyZWN0b3J5OiBzdHJpbmcsXG4gIGlnbm9yZUZpbGVQYXR0ZXJuPzogUmVnRXhwLFxuKTogUHJvbWlzZTxNYW5pZmVzdD4ge1xuICBjb25zdCBmaWxlUGF0aHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdCByb3V0ZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGlzbGFuZHM6IHN0cmluZ1tdID0gW107XG4gIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICBjb2xsZWN0RGlyKGpvaW4oZGlyZWN0b3J5LCBcIi4vcm91dGVzXCIpLCAoZW50cnksIGRpcikgPT4ge1xuICAgICAgY29uc3QgcmVsID0gam9pbihcInJvdXRlc1wiLCByZWxhdGl2ZShkaXIsIGVudHJ5LnBhdGgpKTtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSByZWwuc2xpY2UoMCwgcmVsLmxhc3RJbmRleE9mKFwiLlwiKSk7XG5cbiAgICAgIC8vIEEgYChfaXNsYW5kcylgIHBhdGggc2VnbWVudCBpcyBhIGxvY2FsIGlzbGFuZCBmb2xkZXIuXG4gICAgICAvLyBBbnkgcm91dGUgcGF0aCBzZWdtZW50IHdyYXBwZWQgaW4gYChfLi4uKWAgaXMgaWdub3JlZFxuICAgICAgLy8gZHVyaW5nIHJvdXRlIGNvbGxlY3Rpb24uXG4gICAgICBjb25zdCBtYXRjaCA9IG5vcm1hbGl6ZWQubWF0Y2goR1JPVVBfUkVHKTtcbiAgICAgIGlmIChtYXRjaCAmJiBtYXRjaFsxXS5zdGFydHNXaXRoKFwiX1wiKSkge1xuICAgICAgICBpZiAobWF0Y2hbMV0gPT09IFwiX2lzbGFuZHNcIikge1xuICAgICAgICAgIGlzbGFuZHMucHVzaChyZWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpbGVQYXRocy5oYXMobm9ybWFsaXplZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBSb3V0ZSBjb25mbGljdCBkZXRlY3RlZC4gTXVsdGlwbGUgZmlsZXMgaGF2ZSB0aGUgc2FtZSBuYW1lOiAke2Rpcn0ke25vcm1hbGl6ZWR9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGZpbGVQYXRocy5hZGQobm9ybWFsaXplZCk7XG4gICAgICByb3V0ZXMucHVzaChyZWwpO1xuICAgIH0sIGlnbm9yZUZpbGVQYXR0ZXJuKSxcbiAgICBjb2xsZWN0RGlyKGpvaW4oZGlyZWN0b3J5LCBcIi4vaXNsYW5kc1wiKSwgKGVudHJ5LCBkaXIpID0+IHtcbiAgICAgIGNvbnN0IHJlbCA9IGpvaW4oXCJpc2xhbmRzXCIsIHJlbGF0aXZlKGRpciwgZW50cnkucGF0aCkpO1xuICAgICAgaXNsYW5kcy5wdXNoKHJlbCk7XG4gICAgfSwgaWdub3JlRmlsZVBhdHRlcm4pLFxuICBdKTtcblxuICByb3V0ZXMuc29ydCgpO1xuICBpc2xhbmRzLnNvcnQoKTtcblxuICByZXR1cm4geyByb3V0ZXMsIGlzbGFuZHMgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1hbmlmZXN0KHBhdGg6IHN0cmluZywgaWdub3JlRmlsZVBhdHRlcm4/OiBSZWdFeHApIHtcbiAgY29uc3QgbWFuaWZlc3QgPSBhd2FpdCBjb2xsZWN0KHBhdGgsIGlnbm9yZUZpbGVQYXR0ZXJuKTtcbiAgYXdhaXQgZ2VuZXJhdGUocGF0aCwgbWFuaWZlc3QpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQ0UsY0FBYyxFQUNkLElBQUksRUFDSixRQUFRLEVBQ1IsV0FBVyxFQUNYLElBQUksUUFFQyxZQUFZO0FBQ25CLFNBQVMsUUFBUSxRQUF1QixnQkFBZ0I7QUFDeEQsU0FBUyxRQUFRLFFBQXVCLGdCQUFnQjtBQUN4RCxTQUFTLEtBQUssUUFBUSxhQUFhO0FBQ25DLE1BQU0sbUJBQW1CO0FBQ3pCLE1BQU0sb0JBQW9CO0FBRTFCLE9BQU8sU0FBUztFQUNkLCtEQUErRDtFQUMvRCxJQUNFLENBQUMsZUFDQyxZQUFZLEtBQUssT0FBTyxDQUFDLElBQUksR0FDN0IsWUFBWSxvQkFFZDtJQUNBLElBQUksVUFDRixDQUFDLGFBQWEsRUFBRSxpQkFBaUIsK0NBQStDLENBQUM7SUFFbkYsSUFBSSxLQUFLLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYTtNQUN4QyxXQUNFO0lBQ0osT0FBTztNQUNMLFdBQVc7SUFDYjtJQUVBLE1BQU07RUFDUjtBQUNGO0FBRUEsZUFBZSxXQUNiLEdBQVcsRUFDWCxRQUFpRCxFQUNqRCxvQkFBb0IsaUJBQWlCO0VBRXJDLHdDQUF3QztFQUN4QyxJQUFJO0lBQ0YsTUFBTSxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUM7SUFDN0IsSUFBSSxDQUFDLEtBQUssV0FBVyxFQUFFO0VBQ3pCLEVBQUUsT0FBTyxLQUFLO0lBQ1osSUFBSSxlQUFlLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRTtJQUN6QyxNQUFNO0VBQ1I7RUFFQSxNQUFNLGVBQWUsS0FBSyxLQUFLO0lBQzdCLGFBQWE7SUFDYixjQUFjO0lBQ2QsTUFBTTtNQUFDO01BQU87TUFBTztNQUFNO0tBQUs7SUFDaEMsTUFBTTtNQUFDO0tBQWtCO0VBQzNCO0VBRUEsV0FBVyxNQUFNLFNBQVMsYUFBYztJQUN0QyxTQUFTLE9BQU87RUFDbEI7QUFDRjtBQUVBLE1BQU0sWUFBWTtBQUNsQixPQUFPLGVBQWUsUUFDcEIsU0FBaUIsRUFDakIsaUJBQTBCO0VBRTFCLE1BQU0sWUFBWSxJQUFJO0VBRXRCLE1BQU0sU0FBbUIsRUFBRTtFQUMzQixNQUFNLFVBQW9CLEVBQUU7RUFDNUIsTUFBTSxRQUFRLEdBQUcsQ0FBQztJQUNoQixXQUFXLEtBQUssV0FBVyxhQUFhLENBQUMsT0FBTztNQUM5QyxNQUFNLE1BQU0sS0FBSyxVQUFVLFNBQVMsS0FBSyxNQUFNLElBQUk7TUFDbkQsTUFBTSxhQUFhLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUM7TUFFaEQsd0RBQXdEO01BQ3hELHdEQUF3RDtNQUN4RCwyQkFBMkI7TUFDM0IsTUFBTSxRQUFRLFdBQVcsS0FBSyxDQUFDO01BQy9CLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNO1FBQ3JDLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxZQUFZO1VBQzNCLFFBQVEsSUFBSSxDQUFDO1FBQ2Y7UUFDQTtNQUNGO01BRUEsSUFBSSxVQUFVLEdBQUcsQ0FBQyxhQUFhO1FBQzdCLE1BQU0sSUFBSSxNQUNSLENBQUMsNERBQTRELEVBQUUsTUFBTSxZQUFZO01BRXJGO01BQ0EsVUFBVSxHQUFHLENBQUM7TUFDZCxPQUFPLElBQUksQ0FBQztJQUNkLEdBQUc7SUFDSCxXQUFXLEtBQUssV0FBVyxjQUFjLENBQUMsT0FBTztNQUMvQyxNQUFNLE1BQU0sS0FBSyxXQUFXLFNBQVMsS0FBSyxNQUFNLElBQUk7TUFDcEQsUUFBUSxJQUFJLENBQUM7SUFDZixHQUFHO0dBQ0o7RUFFRCxPQUFPLElBQUk7RUFDWCxRQUFRLElBQUk7RUFFWixPQUFPO0lBQUU7SUFBUTtFQUFRO0FBQzNCO0FBRUEsT0FBTyxlQUFlLFNBQVMsSUFBWSxFQUFFLGlCQUEwQjtFQUNyRSxNQUFNLFdBQVcsTUFBTSxRQUFRLE1BQU07RUFDckMsTUFBTSxTQUFTLE1BQU07QUFDdkIifQ==
// denoCacheMetadata=7164051827934941397,1337818746462179634
