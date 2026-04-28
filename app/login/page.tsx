export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form action="/api/auth/login" method="post" className="w-full space-y-4 rounded-lg border border-zinc-200 p-6">
        <h1 className="text-2xl font-semibold">SelfDesk Login</h1>
        <p className="text-sm text-zinc-600">Enter your app password to unlock your private workspace.</p>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </div>
        <button type="submit" className="w-full rounded bg-zinc-900 px-3 py-2 text-white">
          Unlock
        </button>
      </form>
    </main>
  );
}
