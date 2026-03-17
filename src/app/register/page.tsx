import { AuthForm } from "@/components/auth-form"
import { register } from "@/actions/auth-actions"

export default function RegisterPage() {
  return <AuthForm mode="register" action={register} />
}
