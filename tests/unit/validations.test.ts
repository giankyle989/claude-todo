import { describe, it, expect } from "vitest"
import { registerSchema, loginSchema } from "@/lib/validations"

describe("auth validations", () => {
  describe("registerSchema", () => {
    it("rejects password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        email: "test@test.com",
        password: "short",
      })
      expect(result.success).toBe(false)
    })

    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        email: "test@test.com",
        password: "validpassword",
        name: "Test User",
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "validpassword",
      })
      expect(result.success).toBe(false)
    })

    it("allows optional name", () => {
      const result = registerSchema.safeParse({
        email: "test@test.com",
        password: "validpassword",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("loginSchema", () => {
    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@test.com",
        password: "",
      })
      expect(result.success).toBe(false)
    })

    it("accepts valid login data", () => {
      const result = loginSchema.safeParse({
        email: "test@test.com",
        password: "anypassword",
      })
      expect(result.success).toBe(true)
    })
  })
})
