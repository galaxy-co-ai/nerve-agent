import { redirect } from "next/navigation";

export default async function Home() {
  // Always redirect to dashboard (auth bypassed)
  redirect("/dashboard");
}
