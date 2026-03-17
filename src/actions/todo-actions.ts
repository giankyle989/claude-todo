"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type TodoActionResult = {
  error?: string
}

async function getSessionUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function createTodo(
  _prevState: TodoActionResult | undefined,
  formData: FormData
): Promise<TodoActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { error: "Not authenticated" }

  const title = (formData.get("title") as string)?.trim()
  if (!title) return { error: "Title is required" }

  await prisma.todo.create({
    data: { title, userId },
  })

  revalidatePath("/")
  return {}
}

export async function toggleTodo(id: string): Promise<TodoActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { error: "Not authenticated" }

  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo || todo.userId !== userId) return { error: "Not found" }

  await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  })

  revalidatePath("/")
  return {}
}

export async function deleteTodo(id: string): Promise<TodoActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { error: "Not authenticated" }

  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo || todo.userId !== userId) return { error: "Not found" }

  await prisma.todo.delete({ where: { id } })

  revalidatePath("/")
  return {}
}
