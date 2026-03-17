import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { AddTodoForm } from "@/components/add-todo-form"
import { TodoList } from "@/components/todo-list"

export default async function HomePage() {
  const session = await auth()

  const todos = await prisma.todo.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <AddTodoForm />
        <TodoList todos={todos} />
      </main>
    </div>
  )
}
