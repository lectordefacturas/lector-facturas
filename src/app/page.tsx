import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: articulos, error } = await supabase
    .from("articulos")
    .select("id, codigo_gci, nombre, unidad, es_fruver");

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-2">
          Catálogo Cala di Volpe
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Prueba de conexión con Supabase (Ladrillo 2 · sub-paso 5)
        </p>

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4">
            <p className="font-medium text-red-900 dark:text-red-200">
              Error al conectar con Supabase
            </p>
            <pre className="text-sm text-red-800 dark:text-red-300 mt-2 whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-zinc-900 dark:text-zinc-100 mb-4">
              <span className="font-semibold">Artículos visibles:</span>{" "}
              {articulos?.length ?? 0}
            </p>

            {articulos && articulos.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                ✅ Conexión OK. La lista está vacía porque todavía no hay login
                — RLS está bloqueando la lectura, que es exactamente lo que
                queremos. En el próximo sub-paso agregamos autenticación y van
                a aparecer los artículos de Cala di Volpe.
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
