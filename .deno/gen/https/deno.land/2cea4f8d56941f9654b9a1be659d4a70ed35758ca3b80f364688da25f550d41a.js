// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { parse } from "./parse.ts";
export function canParse(version) {
  try {
    parse(version);
    return true;
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    return false;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIxNi4wL3NlbXZlci9jYW5fcGFyc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIi4vcGFyc2UudHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhblBhcnNlKHZlcnNpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIHBhcnNlKHZlcnNpb24pO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIShlcnIgaW5zdGFuY2VvZiBUeXBlRXJyb3IpKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxTQUFTLEtBQUssUUFBUSxhQUFhO0FBRW5DLE9BQU8sU0FBUyxTQUFTLE9BQWU7RUFDdEMsSUFBSTtJQUNGLE1BQU07SUFDTixPQUFPO0VBQ1QsRUFBRSxPQUFPLEtBQUs7SUFDWixJQUFJLENBQUMsQ0FBQyxlQUFlLFNBQVMsR0FBRztNQUMvQixNQUFNO0lBQ1I7SUFDQSxPQUFPO0VBQ1Q7QUFDRiJ9
// denoCacheMetadata=83620207741287623,16723436407933344909
