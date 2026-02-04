import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--nerve-bg-base)]">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[var(--nerve-bg-elevated)] border border-[var(--nerve-border-subtle)]",
          },
        }}
      />
    </div>
  )
}
