import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Request a magic link
export async function POST(request: NextRequest) {
  try {
    const { email, projectSlug } = await request.json()

    if (!email || !projectSlug) {
      return NextResponse.json(
        { error: "Email and project code are required" },
        { status: 400 }
      )
    }

    // Find the project
    const project = await db.project.findFirst({
      where: {
        slug: projectSlug,
        portalEnabled: true,
      },
    })

    if (!project) {
      // Don't reveal if project exists
      return NextResponse.json({
        success: true,
        message: "If the project exists, a magic link will be sent to your email.",
      })
    }

    // Create magic link token (expires in 1 hour)
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.portalMagicLink.create({
      data: {
        projectId: project.id,
        email,
        token,
        expiresAt,
      },
    })

    // Build the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const magicLink = `${baseUrl}/portal/verify?token=${token}`

    // Try to send email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "noreply@nerve-agent.dev",
            to: email,
            subject: `Access ${project.name} Portal`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2>Access Your Project Portal</h2>
                <p>You requested access to the <strong>${project.name}</strong> portal.</p>
                <p>Click the button below to access your project status and updates:</p>
                <a href="${magicLink}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                  Open Portal
                </a>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
              </div>
            `,
          }),
        })

        if (!response.ok) {
          console.error("Failed to send email:", await response.text())
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError)
      }

      return NextResponse.json({
        success: true,
        message: "Check your email for the magic link.",
      })
    }

    // No email service configured - return the link directly (for development)
    return NextResponse.json({
      success: true,
      message: "Magic link generated.",
      magicLink, // Only included when email service is not configured
      devMode: true,
    })
  } catch (error) {
    console.error("Magic link error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

// Verify a magic link token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 })
  }

  const magicLink = await db.portalMagicLink.findUnique({
    where: { token },
    include: {
      project: {
        select: { portalToken: true, name: true },
      },
    },
  })

  if (!magicLink) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  }

  if (magicLink.usedAt) {
    return NextResponse.json({ error: "Token already used" }, { status: 400 })
  }

  if (magicLink.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 })
  }

  // Mark as used
  await db.portalMagicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  })

  // Set a cookie for 30 days to remember this client
  const cookieStore = await cookies()
  cookieStore.set(`portal_auth_${magicLink.project.portalToken}`, magicLink.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })

  return NextResponse.json({
    success: true,
    portalToken: magicLink.project.portalToken,
    projectName: magicLink.project.name,
  })
}
