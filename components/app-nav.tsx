import Link from "next/link";

export function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/chat" className="text-lg font-semibold">
          SelfDesk
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/chat">Chat</Link>
          <Link href="/notes">Notes</Link>
          <Link href="/files">Files</Link>
          <Link href="/search">Search</Link>
          <form action="/api/auth/logout" method="post">
            <button className="rounded bg-zinc-900 px-3 py-1 text-white" type="submit">
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
