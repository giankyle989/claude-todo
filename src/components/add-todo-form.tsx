"use client"

import { useActionState, useRef, useState, useEffect } from "react"
import { createTodo, type TodoActionResult } from "@/actions/todo-actions"

export function AddTodoForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [, formAction, isPending] = useActionState(
    async (prevState: TodoActionResult | undefined, formData: FormData) => {
      const result = await createTodo(prevState, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setError(null)
        formRef.current?.reset()
      }
      return result
    },
    undefined
  )

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div>
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input
          name="title"
          type="text"
          placeholder="What needs to be done?"
          required
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
