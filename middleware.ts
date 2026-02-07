import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isProfileComplete = token?.isProfileComplete;
        const isObboardingPage = req.nextUrl.pathname.startsWith('/onboarding');
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

        // If logged in but profile incomplete, redirect to onboarding
        // But allow accessing onboarding page itself, api routes, AND Landing Page
        // Also skip for Admins
        const isAdmin = token?.role === 'admin' || token?.role === 'super-admin';
        if (isAuth && !isProfileComplete && !isAdmin && !isObboardingPage && !req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/_next') && req.nextUrl.pathname !== '/') {
            return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        // If logged in, profile complete, trying to access onboarding -> redirect to feed
        if (isAuth && isProfileComplete && isObboardingPage) {
            return NextResponse.redirect(new URL('/feed', req.url));
        }

        // Redirect authenticated users from Landing Page to their respective homes
        if (req.nextUrl.pathname === '/' && isAuth) {
            if (isAdmin) {
                return NextResponse.redirect(new URL('/admin', req.url));
            }
            if (isProfileComplete) {
                return NextResponse.redirect(new URL('/feed', req.url));
            }
            return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow public access to landing page
                if (req.nextUrl.pathname === '/') return true;
                // Require auth for everything else
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login
         * - register
         */
        '/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|login|register).*)',
    ],
};
