export { default } from "next-auth/middleware";

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
