# Spec 0.0.1

Esta carpeta define la primera version funcional de `mafia-god`.
Describe el MVP que debe poder correrse como app web mobile first, local, de un solo dispositivo y compatible con GitHub Pages.

## Objetivo de la version

Permitir jugar una partida completa de Mafia usando un unico celular como soporte del flujo, desde la configuracion inicial hasta el cierre de la partida.

## Alcance

- configuracion de jugadores, orden y reparto de roles;
- revelacion privada de roles jugador por jugador;
- resolucion de rondas con fase de noche, resolucion publica y fase de dia;
- deteccion de condiciones de victoria;
- historial final completo de la partida.

## Fuera de alcance en 0.0.1

- multijugador en red;
- multiples dispositivos sincronizados;
- backend propio;
- chat, timers complejos o animaciones avanzadas;
- roles custom o expansiones fuera de Mafia, Policia, Doctor y Ciudadano;
- sistema detallado de votacion diurna.

## Orden de lectura

1. [../product-scope.md](../product-scope.md)
2. [mvp.md](mvp.md)
3. [game-rules.md](game-rules.md)
4. [use-cases.md](use-cases.md)
5. [ux-look-and-feel.md](ux-look-and-feel.md)
6. [visual-guide.md](visual-guide.md)

## Documentos de esta version

- `mvp.md`: fases, pantallas y flujo de la partida.
- `game-rules.md`: reglas, validaciones y tipos de dominio esperados.
- `use-cases.md`: escenarios funcionales que la version debe cubrir.
- `ux-look-and-feel.md`: especificacion canonica de UX, tono y presentacion visual.
- `visual-guide.md`: resumen corto de la direccion visual de la version.

## Estado de la version

- Estado actual: `wip`.
- Mientras `0.0.1` siga en `wip`, puede recibir cambios funcionales acordados dentro de esta carpeta.
- Cuando `0.0.1` pase a `closed`, cualquier cambio de comportamiento debera abrir una nueva carpeta de version.

## Checklist minima de validacion

- la configuracion empieza con un solo jugador y permite agregar el resto uno por uno;
- la fase de configuracion ofrece un `Modo demo` que carga una partida fija de 8 jugadores y entra directo en revelacion;
- el boton `Siguiente` no se habilita hasta llegar al minimo de jugadores requerido;
- el paso de reparto de roles se muestra despues de completar el grupo;
- la configuracion rechaza repartos invalidos;
- la revelacion inicial no deja fugas de informacion al pasar de un jugador a otro;
- el cierre del modal de rol indica a quien se pasa el celular, o que empieza la noche si ya no quedan jugadores por revelar;
- la noche respeta el orden y saltea muertos;
- cada turno nocturno comienza en una pantalla neutra antes de mostrar acciones privadas;
- cada rol solo puede seleccionar objetivos permitidos;
- la resolucion mafiosa usa sorteo ponderado por votos;
- el Doctor tiene prioridad total al salvar;
- el rezo ciudadano solo activa el 50/50 al llegar al umbral;
- se valida fin de partida tras noche y tras ejecucion diurna;
- el historial final explica de forma completa lo ocurrido.
