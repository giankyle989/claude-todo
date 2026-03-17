"use client"

import { toggleTodo, deleteTodo } from "@/actions/todo-actions"
import { useState, useTransition, useEffect } from "react"

type TodoItemProps = {
  id: string
  title: string
  completed: boolean
}

export function TodoItem({ id, title, completed }: TodoItemProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleTodo(id)
      if (result.error) setError(result.error)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTodo(id)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 ${
          isPending ? "opacity-50" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={completed}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-gray-300"
        />
        <span
          className={`flex-1 text-sm ${
            completed ? "text-gray-400 line-through" : ""
          }`}
        >
          {title}
        </span>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 text-sm"
          aria-label="Delete todo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
