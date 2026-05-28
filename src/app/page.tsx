import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: hoteles } = await supabase
    .from("hoteles")
    .select("nombre")
    .limit(1);
  const hotelNombre = hoteles?.[0]?.nombre ?? null;

  const { data: articulos, error } = await supabase
    .from("articulos")
    .select("id, codigo_gci, nombre, unidad, es_fruver");

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-2 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              {hotelNombre ? `Catálogo · ${hotelNombre}` : "Lector de facturas"}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {user ? (
                <>
                  Logueado como{" "}
                  <span className="font-medium">{user.email}</span>
                </>
              ) : (
                "Sin sesión activa"
              )}
            </p>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/factura/nueva"
                className="text-sm bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded hover:opacity-90"
              >
                Subir factura
              </Link>
              <form action={logout}>
                <button className="text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-3 py-1.5 rounded">
                  Cerrar sesión
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded hover:opacity-90"
            >
              Ingresar
            </Link>
          )}
        </div>

        {error ? (
          <div className="mt-8 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4">
            <p className="font-medium text-red-900 dark:text-red-200">
              Error al conectar con Supabase
            </p>
            <pre className="text-sm text-red-800 dark:text-red-300 mt-2 whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-zinc-900 dark:text-zinc-100 mb-4">
              <span className="font-semibold">Artículos visibles:</span>{" "}
              {articulos?.length ?? 0}
            </p>

            {articulos && articulos.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user
                  ? "No tenés artículos visibles. Probablemente todavía no estás vinculado a ningún hotel en la tabla miembros_hotel."
                  : "Sin sesión activa, RLS bloquea la lectura. Ingresá con un usuario vinculado a Cala di Volpe para ver los artículos."}
              </p>
            ) : (
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {articulos?.map((a) => (
                  <li key={a.id} className="py-3 flex justify-between">
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {a.nombre}{" "}
                      <span className="text-zinc-500 text-sm">
                        ({a.codigo_gci})
                      </span>
                    </span>
                    <span className="text-zinc-500 text-sm">
                      {a.unidad}
                      {a.es_fruver ? " · fruver" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
