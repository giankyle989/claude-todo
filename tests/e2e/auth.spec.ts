import { test, expect } from "@playwright/test"

const testUser = {
  email: `e2e-auth-${process.pid}@test.com`,
  password: "testpassword123",
  name: "E2E User",
}

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login/)
  })

  test("registers a new user and redirects to home", async ({ page }) => {
    await page.goto("/register")
    await page.fill('input[name="name"]', testUser.name)
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL("/")
    await expect(page.getByText(testUser.name)).toBeVisible()
  })

  test("logs out and redirects to login", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL("/")

    await page.click("text=Logout")
    await expect(page).toHaveURL(/\/login/)
  })

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[name="email"]', "wrong@test.com")
    await page.fill('input[name="password"]', "wrongpassword")
    await page.click('button[type="submit"]')
    await expect(page.getByText("Invalid email or password")).toBeVisible()
  })
})
