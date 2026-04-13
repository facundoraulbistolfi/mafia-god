# Spec 0.0.2

Esta carpeta define la iteracion `0.0.2` de `mafia-god`.
La version parte de `0.0.1`, mantiene intacta la logica central de la partida y se enfoca en mejorar la experiencia de setup en mobile, sumar claridad en la noche privada de la Mafia y pulir copy/legibilidad en amanecer y dia.

## Estado de la version

- Estado actual: `wip`.
- `0.0.2` es la version activa en iteracion.
- `0.0.1` sigue cerrada y congelada como baseline funcional.

## Objetivo de la version

Hacer que la configuracion inicial de la partida se sienta mas clara, tactil y amable en celular, sumar una pista visual privada para que la Mafia lea mejor el consenso parcial de su votacion y volver mas legible y expresivo el tramo publico de amanecer/dia sin alterar reglas ni resolucion.

## Alcance

- rediseno del paso `Jugadores`;
- rediseno del paso `Roles`;
- mejora de jerarquia visual, targets tactiles y acciones primarias/secundarias;
- ajuste de claridad y cierre explicito en los modales del flujo;
- mejora puntual de lectura en el turno privado de la Mafia con cuchillos por selecciones mafiosas previas;
- mejora de copy y legibilidad en `round-resolution` y `day`;
- continuidad liviana de mesa para reusar la ultima carga al volver al setup;
- documentacion explicita de alineacion entre specs y codigo para el flujo actualizado.

## Fuera de alcance en 0.0.2

- cambios de reglas o de dominio;
- cambios en briefing o game over;
- cambios de noche por fuera de la pista visual privada para votos mafiosos previos;
- nuevos roles, nuevas fases o cambios de win conditions;
- infraestructura distinta de GitHub Pages.

## Herencia desde 0.0.1

`0.0.2` hereda sin cambios:

- minimo de 4 jugadores;
- alta de jugadores uno por uno;
- validacion de nombres completos antes de habilitar `Siguiente`;
- paso de roles posterior al setup;
- demo con confirmacion y salto directo a revelacion;
- reordenamiento disponible;
- accesos a briefing y reglas.

## Documentos de esta version

- `mvp.md`: definicion funcional del setup actualizado y del pulido publico de amanecer/dia.
- `game-rules.md`: reglas que se mantienen intactas.
- `use-cases.md`: escenarios de setup mobile-friendly, continuidad de mesa y amanecer legible.
- `changes-from-previous.md`: diferencias vs `0.0.1` y chequeo de alineacion spec/codigo.
- `visual-guide.md`: direccion visual puntual para el setup y el tramo publico ajustado.
