import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TypeUser } from "./app/api/auth/[...nextauth]/options";
import { MyUser } from "./next-auth";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const token = await getToken({ req: request });
    const userRole = token?.role as string;

    const publicRoutes = ["/login", "/register"];
    const roleBasedRoutes = {
      Admin: ["/admin", "/dashboard"],
      User: ["/user", "/dashboard"],
    };

    if (!token && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && userRole) {
      const allowedRoutes = roleBasedRoutes[userRole as keyof typeof roleBasedRoutes];
      const isAllowed = allowedRoutes.some((route)=> pathname.startsWith(route));
      if (isAllowed === false) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return null;
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/admin/:path*",
    "/user/:path*",
    "/dashboard",
    "/user/dashboard",
  ],
};
