# Cambios desde 0.0.1

## Resumen

`0.0.2` no cambia la logica del juego.
La diferencia principal es de UX en el setup: mas claridad, mejor jerarquia y un reordenamiento pensado primero para mobile.
Ademas suma una pista privada de consenso parcial para la Mafia durante la noche.
Tambien suma copy unisex, mas variedad de textos publicos y mejor legibilidad en amanecer/dia.

## Chequeo previo de alineacion con 0.0.1

Antes de implementar `0.0.2`, el codigo del setup seguia alineado con `0.0.1` en estos puntos:

- arranque con un jugador vacio por default;
- agregado uno por uno;
- `Siguiente` bloqueado hasta 4 jugadores y nombres completos;
- paso de roles posterior;
- demo con confirmacion y salto a revelacion;
- reordenamiento disponible;
- briefing y reglas accesibles sin romper el flujo.

## Cambios intencionales de 0.0.2

- el reordenamiento en mobile pasa a ser `tap-first`;
- el handle de drag queda como soporte secundario;
- el paso `Jugadores` reorganiza la jerarquia de estado, lista y CTAs;
- el setup puede precargar la ultima mesa confirmada al volver desde una partida pausada o al iniciar una nueva partida;
- `Borrar todo` limpia esa mesa recordada y devuelve el setup a un unico jugador vacio;
- el paso `Roles` compacta el resumen del grupo para priorizar steppers y CTA;
- `Modo demo` se mantiene accesible, pero visualmente secundario.
- los modales del flujo eliminan la cruz de cierre y se resuelven solo con sus CTAs explicitos.
- el turno privado de la Mafia muestra un cuchillo por cada mafia anterior que ya eligio ese target en la misma noche.
- el banner de amanecer usa copy unisex y gana jerarquia tipografica para textos mas largos.
- los textos publicos de muerte y no-muerte pasan a tener un set mas amplio y humor negro absurdo.
- el CTA secundario del amanecer pasa a decir `Pasar a la noche sin ejecutar a nadie`.

## Criterio de cierre para esta tarea

Al terminar la implementacion, debe comprobarse que:

- la nueva spec describa exactamente los CTAs y el flujo del setup;
- el codigo no haya introducido cambios funcionales fuera del setup salvo la pista privada documentada para la Mafia;
- cualquier diferencia intencional frente a `0.0.1` quede nombrada en este documento;
- el setup siga respetando los invariantes heredados de `0.0.1`.

## Chequeo posterior de cierre

Despues de implementar el rediseno del setup, se valida que:

- el setup sigue arrancando con un jugador vacio;
- `Agregar jugador` mantiene el alta uno por uno;
- `Siguiente` sigue bloqueado hasta cumplir minimo y nombres completos;
- el paso `Roles` sigue viniendo despues de `Jugadores`;
- el cold start sigue arrancando con un unico jugador vacio;
- una nueva partida puede reaprovechar la ultima mesa confirmada sin alterar validaciones ni orden;
- `Modo demo` sigue teniendo confirmacion y salto directo a revelacion;
- el reordenamiento sigue disponible y ahora prioriza `subir` y `bajar` en mobile;
- briefing y reglas siguen accesibles sin romper el flujo;
- la noche mantiene sus reglas, pero cada mafia ve cuchillos por votos mafiosos previos sin alterar targets ni resolucion;
- amanecer y dia mantienen el flujo, pero con copy unisex, CTA mas explicito y mejor legibilidad;
- la verificacion automatizada relevante pasa con `test:unit`, `build` y `test:e2e`.
