import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isPublicRoute = publicRoutes.some((route) => pathname === route);
	const hasSessionCookie = request.cookies.has("session");

	if (!hasSessionCookie && !isPublicRoute) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (hasSessionCookie && (pathname === "/login" || pathname === "/register")) {
		return NextResponse.redirect(new URL("/modules", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
