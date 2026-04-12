# Agents

Este archivo fija las reglas de colaboracion para cualquier agente o persona que trabaje en este repositorio.

## Norte del producto

`mafia-god` es una app web mobile first para jugar Mafia con un grupo de personas.
La app debe reemplazar la necesidad de cartas y de narrador, sin perder claridad en el flujo del juego.
El despliegue previsto es GitHub Pages, por lo que cualquier decision tecnica debe respetar ese contexto salvo aprobacion explicita.

## Reglas no negociables

1. Este repositorio se desarrolla siempre de forma `spec driven`.
2. Antes de implementar una feature, leer [Specs/README.md](Specs/README.md), [Specs/product-scope.md](Specs/product-scope.md) y la carpeta de version activa.
3. No cambiar la idea central del producto. Si una propuesta modifica el objetivo, el publico o la forma base de jugar, primero se actualizan los specs y luego el codigo.
4. Priorizar experiencia mobile first. Las decisiones de interfaz deben pensarse primero para pantallas chicas y sesiones de juego presenciales.
5. Mantener compatibilidad con GitHub Pages. Si una solucion requiere backend propio, tiempo real obligatorio o infraestructura externa, hay que frenarse y pedir validacion.
6. Favorecer simplicidad operativa. La app debe ayudar a que una partida arranque rapido y sea facil de seguir para el grupo.
7. No agregar complejidad por estetica o tecnologia si no mejora de forma clara la experiencia de juego.
8. Cada version de specs debe declarar su estado: `wip` o `closed`.
9. Una version `wip` puede recibir cambios funcionales acordados mientras siga en iteracion.
10. Una version `closed` queda congelada. Cualquier cambio de comportamiento posterior requiere una nueva carpeta de version dentro de `Specs/`.

## Forma de trabajar

- Usar `Specs/` como fuente de verdad para vision, alcance, reglas y casos de uso.
- Tratar `Specs/product-scope.md` como documento transversal del producto.
- Tratar `Specs/<version>/` como contrato funcional de cada release.
- Revisar el estado de cada version antes de editarla:
  - si esta en `wip`, se puede seguir refinando;
  - si esta en `closed`, solo admite correcciones editoriales.
- Si aparece una idea nueva, clasificarla como alineada con la version activa, futura version o incompatible con la vision actual.
- Si hay ambiguedad, elegir la opcion mas conservadora y documentar el supuesto en specs antes de tocar comportamiento.

## Criterio de aceptacion para nuevas tareas

Una tarea esta bien orientada si ayuda al menos a uno de estos objetivos:

- iniciar una partida desde el celular con rapidez;
- asignar y consultar roles sin exponer informacion secreta;
- guiar las fases de noche y dia sin narrador;
- registrar el estado de la partida con claridad;
- sostener la experiencia central del juego sin desviar el producto.
