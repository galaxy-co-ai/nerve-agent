import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define route patterns
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
])

const isDevRoute = createRouteMatcher(["/dev(.*)", "/api/dev(.*)"])
const isClientRoute = createRouteMatcher(["/client(.*)", "/api/client(.*)"])

// Organization roles (as defined in Clerk Dashboard)
// Admin - you + investor (full dashboard access)
// Development - investor's dev team (technical access)
// Member - clients (read-only portal)

type OrgRole = "org:admin" | "org:development" | "org:member"

// Role-based route access
const ROLE_ACCESS: Record<string, OrgRole[]> = {
  dev: ["org:admin", "org:development"],
  client: ["org:admin", "org:development", "org:member"],
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgRole, orgId } = await auth()
  const { pathname } = req.nextUrl

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("redirect_url", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If no org selected, redirect to org selection or create
  if (!orgId) {
    // For now, allow access - they'll need to select/create an org
    // In production, you might redirect to /select-org
    return NextResponse.next()
  }

  // Check route access based on org role
  const role = orgRole as OrgRole | null

  if (isDevRoute(req)) {
    // Dev routes: owner, admin, development only
    if (!role || !ROLE_ACCESS.dev.includes(role)) {
      return NextResponse.redirect(new URL("/client", req.url))
    }
  }

  if (isClientRoute(req)) {
    // Client routes: all roles can access
    if (!role || !ROLE_ACCESS.client.includes(role)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Redirect root based on role
  if (pathname === "/") {
    if (role === "org:member") {
      return NextResponse.redirect(new URL("/client", req.url))
    }
    // Admin, development go to dev dashboard
    return NextResponse.redirect(new URL("/dev/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
