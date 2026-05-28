import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-8 font-sans">
      <form
        action={login}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-800 p-6 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Ingresar
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Lector de facturas — Cala di Volpe
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {params.error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {params.error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-black dark:bg-white text-white dark:text-black rounded py-2 font-medium hover:opacity-90"
        >
          Ingresar
        </button>
      </form>
    </main>
  );
}
