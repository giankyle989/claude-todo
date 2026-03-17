import { AuthForm } from "@/components/auth-form"
import { signIn } from "@/lib/auth"
import type { ActionResult } from "@/actions/auth-actions"

async function loginAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  "use server"

  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/",
    })
    return {}
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "CredentialsSignin"
    ) {
      return { error: "Invalid email or password" }
    }
    throw error
  }
}

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} />
}
