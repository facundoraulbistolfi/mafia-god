# UX Look and Feel 0.0.1

## Estado

- Estado actual: `done`

## Tesis visual

`mafia-god` se presenta como un **expediente policial interactivo**. El teléfono es un caso que pasa de mano en mano. Cada pantalla es una pieza de evidencia. La estética es monospace pura, papel oscuro, sellos para contenido confidencial y pestañas de carpeta para metadata.

## Objetivo de experiencia

La interfaz debe ayudar a que el grupo:

- entienda de inmediato en qué fase está;
- reconozca si la pantalla es segura para mirar en grupo o privada (mediante borde izquierdo de color);
- pase el celular sin dudas ni leaks;
- complete cada acción en pocos segundos y con una sola mano.

## Principios rectores

### 1. Expediente monospace

- Única familia tipográfica: `'Courier New', 'Courier', monospace` para todo — títulos, body, labels, botones, inputs.
- Fondo oscuro (`#12100c`) con textura sutil de líneas verticales finas.
- Emojis nativos del sistema como iconografía principal en lugar de SVGs custom.
- Presencia visual de dossier, nunca terror ni arcade.

### 2. Cine breve

- Un título corto en uppercase.
- Una sola línea de orientación.
- Un CTA dominante.
- No usar párrafos largos, lore ni aclaraciones redundantes.

### 3. Fases que se sienten distintas

- `Noche`: fondo azul frío (`#0c0e16`), textos en azul (`#e0e8f4`), acentos `#8ea4cc`.
- `Día`: fondo verde oliva (`#121610`), textos en verde (`#d8ecc0`), acentos `#90b060`.
- `Setup`, `briefing`, `resolución`, `fin`: fondo base neutro (`#12100c`), texto `#e8e0d0`.
- La señalización de fase está siempre visible en el top rail con emojis de fase.

### 4. Privacidad expresiva

Borde izquierdo de 4px como indicador principal e inmediato:
- `Público` (`🔓`): verde grisáceo `rgba(140, 165, 140, 0.5)`.
- `Pase` (`📱`): dorado `#c8aa64`.
- `Privado` (`🔒`): rojo `#c43030`.

Ninguna pantalla segura hereda colores, textos ni íconos de rol por accidente.

### 5. Mobile first real

- La jerarquía principal entra casi completa en 375px.
- Setup puede scrollear de forma controlada.
- Las acciones principales están cerca de la zona cómoda del pulgar.
- El flujo de teclado virtual facilita el ingreso rápido.

### 6. Movimiento y transición

- Transiciones de fase: fade + translateY(6px), 300ms.
- Reveals dramáticos: opacity + scale + blur, 600ms con 800ms delay.
- Feedback interactivo: 160ms.
- Sin animaciones decorativas ni loops.
- Todas colapsan a instantáneas con `prefers-reduced-motion`.

## Sistema visual de modos

### Modo `público`

Uso: setup, briefing, intro de noche, resolución, día, fin, reanudación.

Reglas:
- borde izquierdo verde grisáceo;
- puede mostrar contexto general de partida, nunca secreto de rol.

### Modo `pase`

Uso: pase de teléfono en revelación y entre turnos nocturnos.

Reglas:
- borde izquierdo dorado;
- foco en el nombre de quien recibe el celular;
- una sola acción visible.

### Modo `privado`

Uso: modal de rol, acción nocturna, feedback privado de la Policía.

Reglas:
- borde izquierdo rojo;
- sello `🔒 CONFIDENCIAL` visible;
- el cierre siempre devuelve a un estado seguro.

## Sistema visual de fases

### Setup

- Sensación: apertura de un caso nuevo.
- Kicker: `📋 NUEVO CASO`.
- Drag & drop para reordenar jugadores (handle `≡`), con flechas como fallback.

### Briefing

- **Nueva fase** entre setup y role-reveal.
- Carrusel de 4 slides con dot indicators.
- Botones: `SIGUIENTE →` / `COMENZAR →` (último slide) / `SALTAR`.
- Accesible desde cualquier fase post-setup con botón `📖` en el top rail.

### Revelación

- Sensación: sobre secreto o dossier personal.
- Pase: `📱 PASE`, borde dorado, nombre del jugador activo en tamaño grande.
- Privado: `🔒 CONFIDENCIAL`, emoji del rol grande, descripción de una línea.

### Noche

- Sensación: tensión y ceremonia breve.
- Fondo azul frío. Kicker `🌙 NOCHE`.
- Intro: `CAE LA NOCHE` / `🤫 Todos cierran los ojos.`
- Botón: `COMENZAR RONDA 🔦`.

### Resolución

- Sensación: parte oficial de la ronda.
- `💀 MURIÓ {NOMBRE}` o `🛡️ NADIE MURIÓ`.
- Reveal animado con 800ms de delay.
- Botón: `☀️ IR AL DÍA`.

### Día

- Sensación: mesa abierta y decisión colectiva.
- Fondo verde oliva. Kicker `☀️ DÍA`.
- Título: `DELIBERACIÓN`. Subtítulo: `🗣️ Hablen, acusen, defiendan...`
- Botones: `⚖️ EJECUTAR` y `🌙 NOCHE`.

### Fin

- Kicker: `📁 CASO CERRADO`.
- Emoji `🏆`, ganador en uppercase, expediente final con lista de jugadores.
- Botón: `🔄 NUEVA PARTIDA`.

## Frame principal

- `top rail` compacto y persistente: `🔍 MAFIA GOD` + badges de fase/modo + botón `📖`.
- Cada pantalla usa una `scene` principal con `data-phase` y `data-screen-mode` para variar colores via CSS.
- Estructura: kicker → título → cuerpo → footer con CTA.

## Primitivas de layout

- `top rail` compacto y persistente;
- `scene header` con kicker (uppercase, letter-spacing), título corto y una línea de orientación;
- `rail-badges` para fase, modo y ronda;
- `action-dock` para CTA principal y secundario;
- `target-list` para targets, jugadores e historial;
- `panel-card` como contenedor de contenido secundario.

No apilar superficies por costumbre. Si un bloque no ayuda a decidir o a orientarse, sobra.

## Copy

### Tono

- directo y monospace;
- uppercase en kickers y botones;
- sin ironía;
- con atmósfera de expediente/caso policial;
- sin narrador explicando de más.

### Reglas

- kickers en uppercase con emoji;
- botones CTA en uppercase con emoji al final;
- usar verbos concretos;
- no repetir la misma instrucción en tres lugares;
- el CTA resuelve la siguiente acción sin ambigüedad.

### Ejemplos

- `📋 NUEVO CASO` / `Sospechosos`
- `COMENZAR RONDA 🔦`
- `⚖️ EJECUTAR` / `🌙 NOCHE`
- `📁 CASO CERRADO`
- `🔄 NUEVA PARTIDA`

## Criterios de aceptación por pantalla

### Setup

- el usuario puede empezar a escribir enseguida;
- validaciones y cantidad de jugadores se leen sin ruido;
- drag & drop visible con handle `≡`;
- modo demo accesible pero no dominante.

### Reveal handoff

- domina el nombre del jugador activo en dorado;
- se percibe como pantalla segura (borde dorado);
- tiene una sola acción principal.

### Reveal private

- el emoji del rol se entiende de inmediato;
- sello `🔒 CONFIDENCIAL` visible;
- el cierre deja claro a quién pasar o si empieza la noche.

### Night intro y handoff

- clarísimo que la noche empezó (fondo azul);
- queda claro si todos deben tener los ojos cerrados;
- el nombre del siguiente jugador se detecta en segundos.

### Night private action

- el jugador entiende qué acción puede hacer sin leer demasiado;
- los targets se pueden recorrer y tocar fácilmente;
- el CTA de confirmación domina el cierre de la escena.

### Resolution

- el mensaje público es lo primero que se ve;
- no hay ningún indicio visual de mecánicas ocultas;
- el siguiente paso está a un toque.

### Day

- fondo verde oliva distingue el día de la noche;
- se distinguen con claridad las dos acciones posibles;
- la UI mantiene tono público y colectivo.

### Game over

- ganador y estado final se leen antes que el historial;
- el historial queda ordenado por ronda;
- el CTA final `🔄 NUEVA PARTIDA` es claro.
