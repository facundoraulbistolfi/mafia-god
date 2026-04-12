# Product Scope

## Vision

Construir una app web mobile first para facilitar partidas de Mafia en grupo, usando el celular como soporte del juego.
La app debe reemplazar cartas y narrador, manteniendo simple el armado de la partida y claro el seguimiento de cada fase.

## Objetivo del producto

Permitir que un grupo de personas juegue Mafia de forma mas autonoma, ordenada y accesible, sin depender de materiales fisicos ni de una persona dedicada a moderar.

## Restricciones base

- La aplicacion se piensa primero para celular.
- El hosting objetivo es GitHub Pages.
- La experiencia central tiene que funcionar sin cartas.
- La experiencia central tiene que funcionar sin narrador humano.
- El valor principal del producto es asistir el flujo de la partida, no reemplazar la interaccion social del juego.

## Principios del producto

1. Rapidez para empezar: una partida debe poder configurarse con pocos pasos.
2. Claridad de informacion: cada jugador debe entender que hacer en su turno o fase.
3. Privacidad local: la app no debe exponer roles o acciones secretas por descuidos de interfaz.
4. Friccion minima: cada paso debe sentirse natural para un grupo reunido en persona.
5. Alcance controlado: cualquier extension debe reforzar la experiencia base de Mafia, no convertir el proyecto en una plataforma generica de party games.

## Lo que este proyecto no debe hacer por defecto

- No debe requerir un narrador humano para que la partida funcione.
- No debe depender de cartas u otros elementos fisicos como parte obligatoria del flujo.
- No debe priorizar desktop por encima de mobile.
- No debe asumir infraestructura distinta de GitHub Pages sin una decision explicita.
- No debe crecer alrededor de features accesorias que distraigan del flujo principal de juego.

## Pregunta de control para futuras decisiones

Antes de aprobar una feature, preguntarnos:

`Esto ayuda a jugar Mafia en grupo desde el celular, sin cartas ni narrador, dentro de una web app hosteable en GitHub Pages?`

Si la respuesta no es claramente si, la feature necesita revision de alcance.
