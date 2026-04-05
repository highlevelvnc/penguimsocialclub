import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <span className="text-3xl">🐧</span>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-zinc-200">404</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Page not found
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white hover:bg-zinc-800 transition-all active:scale-[0.98]"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
