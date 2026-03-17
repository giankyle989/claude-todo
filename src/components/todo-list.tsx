import { TodoItem } from "@/components/todo-item"

type Todo = {
  id: string
  title: string
  completed: boolean
}

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-8">
        No todos yet. Add one above!
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          title={todo.title}
          completed={todo.completed}
        />
      ))}
    </div>
  )
}
