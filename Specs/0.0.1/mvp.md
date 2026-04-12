# MVP 0.0.1

## Resumen

La version `0.0.1` cubre una partida completa de Mafia en un solo dispositivo.
La experiencia debe ser mobile first, con una sola accion principal por pantalla y lenguaje utilitario directo.

## Reglas generales de interfaz

- La app se usa pasando un unico celular entre los jugadores.
- Durante la partida solo debe mostrarse informacion publica o privada del jugador activo.
- La app debe minimizar filtraciones accidentales de informacion secreta.
- El orden configurado al inicio gobierna revelacion de roles, pases de celular y turnos nocturnos.
- Los jugadores muertos se saltean sin reordenar la lista.
- Toda vista privada debe abrirse desde una pantalla neutra con una accion explicita de ingreso.

## Fase 1 - Configuracion de partida

### Objetivo

Dejar la partida lista para asignar roles y comenzar sin materiales externos.

### Flujo

1. Mostrar un unico jugador vacio por default.
2. Agregar jugadores uno por vez hasta completar el grupo.
3. Cargar los nombres de todos los jugadores y definir el orden circular.
4. Mantener deshabilitado el boton `Siguiente` hasta llegar al minimo de 4 jugadores y tener todos los nombres cargados.
5. Al tocar `Siguiente`, pasar al paso de reparto de roles.
6. Visualizar el reparto sugerido de roles ya precargado segun la cantidad de jugadores.
7. Ajustar manualmente las cantidades por rol si hace falta.
8. Confirmar con `Iniciar partida` y generar la asignacion de roles.

### Atajo opcional: modo demo

La configuracion puede ofrecer un CTA secundario `Modo demo` o `Cargar demo`.
Ese atajo debe:

- cargar de una vez una partida fija de 8 jugadores;
- respetar el orden del elenco demo;
- respetar el reparto fijo de roles;
- entrar directamente a la fase de revelacion, sin pasar por la edicion manual del setup.
- explicarse desde una confirmacion o detalle contextual antes de ejecutarse, para no competir visualmente con el ingreso manual de jugadores;
- dejar una salida clara para cancelar y volver al setup sin cambios.

El elenco demo para `0.0.1` es:

1. Miss Marple - Policia
2. Dr. Haydock - Doctor
3. Anne Protheroe - Mafia
4. Lawrence Redding - Mafia
5. Leonard Clement - Ciudadano
6. Griselda Clement - Ciudadano
7. Lettice Protheroe - Ciudadano
8. Hawes - Ciudadano

### Datos que se configuran

- lista de jugadores;
- cantidad total derivada del grupo cargado;
- nombres de jugadores;
- orden circular unico;
- cantidades de Mafia, Policia, Doctor y Ciudadano.

### Validaciones

- Deben existir al menos 4 jugadores.
- Todos los jugadores deben tener nombre no vacio.
- La suma de roles debe coincidir con la cantidad de jugadores.
- Debe quedar al menos 1 Mafia, 1 Policia, 1 Doctor y 1 Ciudadano.

## Fase 2 - Inicio de partida

### Objetivo

Revelar el rol de cada jugador en privado sin usar cartas.

### Flujo por jugador

1. Mostrar la pantalla `Pasar al jugador {{nombre}}`.
2. Mostrar una unica accion principal: `Ver rol`.
3. Abrir un modal con el rol asignado.
4. Si el rol es Mafia y existe al menos otro mafia en la partida, mostrar tambien quienes son los otros mafias.
5. Mostrar una accion de cierre contextual:
   - `Cerrar y pasar a {{siguienteNombre}}` si queda otro jugador por revelar.
   - `Cerrar y empezar la noche` si es el ultimo jugador.
6. Al cerrar, volver a una pantalla neutra sin informacion secreta visible.

### Regla de privacidad

- La pantalla de pase nunca debe dejar visible el rol del jugador anterior.
- El texto de cierre debe anticipar el siguiente paso para que el grupo sepa como continuar.

## Fase 3 - Noche

### Objetivo

Guiar todas las acciones nocturnas sin narrador humano.

### Apertura de fase

Antes de iniciar los turnos nocturnos, la app debe indicar que todos deben mantener los ojos cerrados y que solo el jugador que tiene el celular puede abrirlos.

### Flujo por jugador vivo

1. Mostrar una pantalla neutra de pase con la instruccion `Pasar el celular a {{nombre}}`.
2. Recordar que todos los demas deben seguir con los ojos cerrados.
3. Mostrar una unica accion principal: `Ver acciones`.
4. Abrir una pantalla privada con la instruccion `Solo {{nombre}} puede abrir los ojos`.
5. Mostrar la accion o seleccion correspondiente a su rol.
6. Registrar la seleccion del jugador.
7. Volver a una pantalla neutra para `{{siguienteNombre}}`, o avanzar a resolucion si no quedan mas turnos.

### Acciones por rol

- Policia: elegir otro jugador vivo para inspeccionarlo.
- Doctor: elegir cualquier jugador vivo para salvarlo, incluido el mismo.
- Mafia: elegir otro jugador vivo que no sea mafia.
- Ciudadano: elegir cualquier jugador vivo para rezar por esa persona, incluido el mismo.

### Feedback privado

- La Policia, despues de elegir, ve durante 3 segundos un resultado binario: `Es Mafia` o `No es Mafia`.
- Doctor, Mafia y Ciudadano no reciben informacion adicional sobre el resultado final de la ronda en ese momento.

### Regla de coreografia

La noche debe usar el mismo patron de privacidad que la revelacion de roles:

- primero una pantalla neutra con el nombre de quien recibe el celular;
- despues una accion explicita para abrir la informacion privada;
- al terminar, retorno a un estado neutro antes del siguiente pase.

## Fase 4 - Resolucion de ronda

### Objetivo

Resolver el resultado de la noche y comunicar solo la parte publica del desenlace.

### Flujo

1. Calcular el objetivo de los mafias segun los votos emitidos.
2. Aplicar salvacion del Doctor si corresponde.
3. Aplicar la regla de rezos ciudadanos si corresponde.
4. Determinar si alguien muere o si nadie muere.
5. Mostrar un resultado publico simple.
6. Validar condicion de fin de partida.
7. Si la partida sigue, pasar a la fase de dia.

### Resultado publico permitido

- `Murio {{nombre}}`
- `Nadie murio`

La app no debe revelar en esta fase que accion especifica produjo ese resultado.

## Fase 5 - Dia

### Objetivo

Dar soporte minimo a la discusion y a la decision colectiva del grupo antes de volver a la noche.

### Flujo

1. Mostrar la pantalla de dia.
2. Ofrecer solo dos acciones: `Ejecutar a alguien` o `Pasar a la noche`.
3. Si se elige ejecutar, permitir seleccionar entre los jugadores vivos.
4. Aplicar la ejecucion.
5. Validar condicion de fin de partida.
6. Si la partida sigue, volver a la fase de noche.

### Simplificacion explicitada

La version `0.0.1` no incluye sistema de votos, debate cronometrado ni desempates complejos.
La app solo registra la decision final del grupo.

## Fase 6 - Fin de partida

### Objetivo

Cerrar la partida con claridad y liberar toda la informacion reservada.

### Contenido de la pantalla final

- ganador de la partida;
- estado final de todos los jugadores;
- historial completo de las rondas;
- detalle de acciones ocultas y causas reales de cada desenlace.

## Consideraciones de implementacion permitidas

- La implementacion puede persistir el estado en almacenamiento local del navegador para tolerar una recarga accidental.
- La persistencia no cambia el hecho de que la version `0.0.1` es local, single-device y compatible con GitHub Pages.
