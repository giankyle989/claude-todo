import { auth, signOut } from "@/lib/auth"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold">Todo App</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {session?.user?.name || session?.user?.email}
          </span>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
