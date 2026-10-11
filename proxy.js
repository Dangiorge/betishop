import nextAuthMiddleware from "next-auth/middleware";

export function proxy(request) {
  return nextAuthMiddleware(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/categories/:path*",
    "/products/:path*",
    "/sales/:path*",
    "/expenses/:path*",
    "/employees/:path*",
    "/closing/:path*",
    "/stock-count/:path*",
  ],
};
