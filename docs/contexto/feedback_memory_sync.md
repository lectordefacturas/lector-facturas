---
name: feedback-memory-sync
description: Las memorias del proyecto se sincronizan a docs/contexto/ del repo para que viajen entre compus
metadata: 
  node_type: memory
  type: feedback
  originSessionId: cb105876-5091-4efa-aa62-d7a2dfa54619
---

**Regla:** después de crear o actualizar cualquier archivo de memoria en `C:\Users\Santi\.claude\projects\…\memory\`, copiar también el cambio a `docs/contexto/` dentro del repo. Hacerlo en la misma sesión donde se crea la memoria, antes de cerrar.

**Why:** Santi trabaja en dos compus (casa + trabajo). Las memorias de Claude viven a nivel de máquina, no de proyecto. Si solo guardo en la carpeta `.claude/` local, mañana cuando arranque en la otra compu pierdo todo el contexto. La carpeta `docs/contexto/` está en el repo, viaja vía Git, y se sincroniza automáticamente entre máquinas.

**How to apply:**
- Cuando creo/edito un `.md` en la carpeta canónica de memoria → inmediatamente copiarlo a `docs/contexto/` del proyecto con el mismo nombre.
- Mantener `MEMORY.md` espejado en los dos lugares.
- Antes de cerrar una sesión donde hubo cambios de memoria → sugerir commit + push, así llegan a GitHub y a la otra compu.
- Al arrancar Claude en una compu nueva por primera vez → Santi me dice "leé docs/contexto/" y de ahí saco el contexto. Después de leerlos, copiarlos a la carpeta canónica local (`.claude/…/memory/`) para tenerlos accesibles automáticamente en futuras sesiones de esa compu.

**Carpeta canónica vs carpeta sincronizada:**
- Canónica (la que Claude Code usa automáticamente): `C:\Users\Santi\.claude\projects\<slug>\memory\`. Específica de cada compu.
- Sincronizada (la que viaja por Git): `docs/contexto/` dentro del repo. Misma información, otra ubicación.

Relacionado: [[feedback-workflow]], [[feedback-execution]].
