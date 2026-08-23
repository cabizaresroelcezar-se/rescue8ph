// This file is kept for reference. The actual middleware is in src/middleware.ts.
// The middleware handles:
//   1. Session refresh (cookie-based)
//   2. Route protection (redirects to /auth/login for /account and /admin)
//   3. Auth redirect (redirects logged-in users away from /auth/login and /auth/register)