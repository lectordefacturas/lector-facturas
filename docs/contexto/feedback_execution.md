---
name: feedback-execution
description: Santiago quiere que Claude ejecute el 99% del trabajo — él solo decide y verifica
metadata: 
  node_type: memory
  type: feedback
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Regla:** ejecutar yo (Claude) todo lo que pueda con mis herramientas. Santiago solo hace algo si REALMENTE no puedo (ej: clic en una UI web tipo Supabase/Vercel, instalar algo que requiere su contraseña de admin, pegar una API key, decisiones de producto).

**Why:** él lo dijo explícito en sesión del 2026-05-27 ("yo solo tomo decisiones, y si tengo que hacer algo es porque vos REALMENTE no podes hacerlo, no por vagueza"). No es por vagancia — es el reparto de roles del proyecto: él dirige y verifica, yo ejecuto.

**How to apply:**
- Comandos de terminal (npm, git, node, scripts) → los corro yo con Bash/PowerShell, no le pido que los pegue.
- Crear/editar archivos de código → siempre yo con Write/Edit.
- Si un comando es interactivo (menús), buscar la versión con flags para evitar el prompt.
- Lo que SÍ queda para Santiago: clics en webs (Supabase dashboard, Vercel, Google Cloud), pegar API keys, decisiones de diseño/producto, verificar resultados visuales.
- Sigue valiendo [[feedback-workflow]]: explicar antes de hacer y esperar luz verde — pero la ejecución es mía.

Relacionado: [[feedback-workflow]], [[user-profile]].
