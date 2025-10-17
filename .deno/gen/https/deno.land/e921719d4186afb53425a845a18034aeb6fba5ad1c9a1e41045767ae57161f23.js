// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { dirname } from "../path/dirname.ts";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { toPathString } from "./_to_path_string.ts";
/**
 * Ensures that the hard link exists.
 * If the directory structure does not exist, it is created.
 *
 * @example
 * ```ts
 * import { ensureSymlink } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * ensureSymlink("./folder/targetFile.dat", "./folder/targetFile.link.dat"); // returns promise
 * ```
 *
 * @param src the source file path. Directory hard links are not allowed.
 * @param dest the destination link path
 */ export async function ensureLink(src, dest) {
  dest = toPathString(dest);
  await ensureDir(dirname(dest));
  await Deno.link(toPathString(src), dest);
}
/**
 * Ensures that the hard link exists.
 * If the directory structure does not exist, it is created.
 *
 * @example
 * ```ts
 * import { ensureSymlinkSync } from "https://deno.land/std@$STD_VERSION/fs/mod.ts";
 *
 * ensureSymlinkSync("./folder/targetFile.dat", "./folder/targetFile.link.dat"); // void
 * ```
 *
 * @param src the source file path. Directory hard links are not allowed.
 * @param dest the destination link path
 */ export function ensureLinkSync(src, dest) {
  dest = toPathString(dest);
  ensureDirSync(dirname(dest));
  Deno.linkSync(toPathString(src), dest);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL2ZzL2Vuc3VyZV9saW5rLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcIi4uL3BhdGgvZGlybmFtZS50c1wiO1xuaW1wb3J0IHsgZW5zdXJlRGlyLCBlbnN1cmVEaXJTeW5jIH0gZnJvbSBcIi4vZW5zdXJlX2Rpci50c1wiO1xuaW1wb3J0IHsgdG9QYXRoU3RyaW5nIH0gZnJvbSBcIi4vX3RvX3BhdGhfc3RyaW5nLnRzXCI7XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBoYXJkIGxpbmsgZXhpc3RzLlxuICogSWYgdGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbnN1cmVTeW1saW5rIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vZnMvbW9kLnRzXCI7XG4gKlxuICogZW5zdXJlU3ltbGluayhcIi4vZm9sZGVyL3RhcmdldEZpbGUuZGF0XCIsIFwiLi9mb2xkZXIvdGFyZ2V0RmlsZS5saW5rLmRhdFwiKTsgLy8gcmV0dXJucyBwcm9taXNlXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjIHRoZSBzb3VyY2UgZmlsZSBwYXRoLiBEaXJlY3RvcnkgaGFyZCBsaW5rcyBhcmUgbm90IGFsbG93ZWQuXG4gKiBAcGFyYW0gZGVzdCB0aGUgZGVzdGluYXRpb24gbGluayBwYXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbnN1cmVMaW5rKHNyYzogc3RyaW5nIHwgVVJMLCBkZXN0OiBzdHJpbmcgfCBVUkwpIHtcbiAgZGVzdCA9IHRvUGF0aFN0cmluZyhkZXN0KTtcbiAgYXdhaXQgZW5zdXJlRGlyKGRpcm5hbWUoZGVzdCkpO1xuXG4gIGF3YWl0IERlbm8ubGluayh0b1BhdGhTdHJpbmcoc3JjKSwgZGVzdCk7XG59XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBoYXJkIGxpbmsgZXhpc3RzLlxuICogSWYgdGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZG9lcyBub3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbnN1cmVTeW1saW5rU3luYyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2ZzL21vZC50c1wiO1xuICpcbiAqIGVuc3VyZVN5bWxpbmtTeW5jKFwiLi9mb2xkZXIvdGFyZ2V0RmlsZS5kYXRcIiwgXCIuL2ZvbGRlci90YXJnZXRGaWxlLmxpbmsuZGF0XCIpOyAvLyB2b2lkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc3JjIHRoZSBzb3VyY2UgZmlsZSBwYXRoLiBEaXJlY3RvcnkgaGFyZCBsaW5rcyBhcmUgbm90IGFsbG93ZWQuXG4gKiBAcGFyYW0gZGVzdCB0aGUgZGVzdGluYXRpb24gbGluayBwYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVMaW5rU3luYyhzcmM6IHN0cmluZyB8IFVSTCwgZGVzdDogc3RyaW5nIHwgVVJMKSB7XG4gIGRlc3QgPSB0b1BhdGhTdHJpbmcoZGVzdCk7XG4gIGVuc3VyZURpclN5bmMoZGlybmFtZShkZXN0KSk7XG5cbiAgRGVuby5saW5rU3luYyh0b1BhdGhTdHJpbmcoc3JjKSwgZGVzdCk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLFNBQVMsT0FBTyxRQUFRLHFCQUFxQjtBQUM3QyxTQUFTLFNBQVMsRUFBRSxhQUFhLFFBQVEsa0JBQWtCO0FBQzNELFNBQVMsWUFBWSxRQUFRLHVCQUF1QjtBQUVwRDs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxlQUFlLFdBQVcsR0FBaUIsRUFBRSxJQUFrQjtFQUNwRSxPQUFPLGFBQWE7RUFDcEIsTUFBTSxVQUFVLFFBQVE7RUFFeEIsTUFBTSxLQUFLLElBQUksQ0FBQyxhQUFhLE1BQU07QUFDckM7QUFFQTs7Ozs7Ozs7Ozs7OztDQWFDLEdBQ0QsT0FBTyxTQUFTLGVBQWUsR0FBaUIsRUFBRSxJQUFrQjtFQUNsRSxPQUFPLGFBQWE7RUFDcEIsY0FBYyxRQUFRO0VBRXRCLEtBQUssUUFBUSxDQUFDLGFBQWEsTUFBTTtBQUNuQyJ9
// denoCacheMetadata=12653453459308811971,14342565935848103700
