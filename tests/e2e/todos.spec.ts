import { test, expect } from "@playwright/test"

const testUser = {
  email: `e2e-todo-${process.pid}@test.com`,
  password: "testpassword123",
  name: "Todo User",
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await page.goto("/register")
  await page.fill('input[name="name"]', testUser.name)
  await page.fill('input[name="email"]', testUser.email)
  await page.fill('input[name="password"]', testUser.password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL("/")
  await page.close()
})

test.beforeEach(async ({ page }) => {
  await page.goto("/login")
  await page.fill('input[name="email"]', testUser.email)
  await page.fill('input[name="password"]', testUser.password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL("/")
})

test.describe.serial("Todos", () => {
  test("shows empty state when no todos", async ({ page }) => {
    await expect(page.getByText("No todos yet")).toBeVisible()
  })

  test("creates a todo", async ({ page }) => {
    await page.fill('input[name="title"]', "Buy groceries")
    await page.click("text=Add")
    await expect(page.getByText("Buy groceries")).toBeVisible()
  })

  test("toggles a todo complete", async ({ page }) => {
    await page.fill('input[name="title"]', "Toggle me")
    await page.click("text=Add")
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.check()
    await expect(page.getByText("Toggle me")).toHaveClass(/line-through/)
  })

  test("deletes a todo", async ({ page }) => {
    await page.fill('input[name="title"]', "Delete me")
    await page.click("text=Add")
    await expect(page.getByText("Delete me")).toBeVisible()
    await page.getByLabel("Delete todo").first().click()
    await expect(page.getByText("Delete me")).not.toBeVisible()
  })
})
