import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NuevaFacturaForm } from "./form";

export default async function NuevaFacturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Volver al catálogo
        </Link>

        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 mt-4 mb-2">
          Subir factura
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Subí un JPG o PNG de una factura. Gemini la lee y te muestra los
          productos extraídos.
        </p>

        <NuevaFacturaForm />
      </div>
    </main>
  );
}
