# Game Rules 0.0.1

## Roles del MVP

- Mafia
- Policia
- Doctor
- Ciudadano

## Reparto sugerido de roles

El reparto sugerido base para `n` jugadores es:

- `1` Policia;
- `1` Doctor;
- `max(1, floor(n / 4))` Mafias;
- el resto, Ciudadanos.

## Reglas de configuracion

- La partida requiere al menos 4 jugadores.
- No hay tope duro de jugadores en specs `0.0.1`.
- La cantidad de jugadores se define agregando jugadores uno por uno en la primera pantalla de setup.
- El reparto sugerido puede ajustarse manualmente.
- El paso de roles se habilita solo despues de completar un grupo valido para jugar.
- Al entrar al paso de roles, el reparto sugerido debe venir precargado segun la cantidad actual de jugadores.
- La suma final de roles debe coincidir con la cantidad de jugadores.
- La configuracion validada debe conservar al menos 1 Mafia, 1 Policia, 1 Doctor y 1 Ciudadano.

## Tipos de dominio esperados

- `Role`: `mafia`, `police`, `doctor`, `citizen`.
- `GamePhase`: `setup`, `role-reveal`, `night`, `round-resolution`, `day`, `game-over`.
- `Player`: identificador, nombre, rol, estado de vida y posicion en el orden circular.
- `NightAction`: actor, rol, objetivo, ronda y resultado privado si aplica.
- `RoundRecord`: numero de ronda, acciones nocturnas, resultado mafioso, salvaciones, ejecucion diurna y mensaje publico.
- `GameResult`: ganador, estado final de jugadores e historial completo de la partida.

## Regla de orden

- Existe un solo orden circular de juego.
- Ese orden gobierna la revelacion inicial, el pase del celular y los turnos de noche.
- Los jugadores muertos se saltean, pero su posicion original no cambia.

## Reglas de visibilidad y pase

### Revelacion inicial

- Cada jugador entra a su informacion privada desde una pantalla neutra.
- El cierre del modal de rol debe anticipar el siguiente paso visible.
- Si hay otro jugador pendiente, el cierre debe decir `Cerrar y pasar a {{siguienteNombre}}`.
- Si no quedan jugadores pendientes, el cierre debe decir `Cerrar y empezar la noche`.

### Turnos nocturnos

- Antes de mostrar cualquier accion privada de noche, la app debe mostrar una pantalla neutra de pase.
- Esa pantalla debe nombrar explicitamente al jugador que recibe el celular.
- Desde esa pantalla solo puede abrirse una accion principal: `Ver acciones`.
- Despues de registrar la accion del jugador, la app vuelve a un estado neutro antes de pasar al siguiente turno o a la resolucion.

## Reglas de seleccion por rol

### Policia

- Solo puede elegir otro jugador vivo.
- No puede elegirse a si mismo.
- Recibe un unico resultado binario: `Es Mafia` o `No es Mafia`.

### Doctor

- Puede elegir cualquier jugador vivo.
- Puede elegirse a si mismo.
- Si hay mas de un Doctor, cada uno realiza una accion independiente.

### Mafia

- Solo puede elegir otro jugador vivo.
- No puede elegir mafias.
- Si hay mas de un Mafia, cada mafia vota por separado.

### Ciudadano

- Puede elegir cualquier jugador vivo.
- Puede elegirse a si mismo.
- Si hay mas de un Ciudadano, cada uno reza por separado.

## Resolucion de la noche

### Paso 1 - Objetivo mafioso

- Se toman todos los votos de los mafias vivos.
- Cada voto agrega una unidad de peso al objetivo elegido.
- El objetivo final se resuelve por sorteo ponderado segun esos pesos.

Ejemplo:

- 2 mafias votan a personas distintas: cada objetivo tiene 50 por ciento.
- 2 mafias votan a una persona y 1 mafia vota a otra: los pesos son 2 contra 1.

### Paso 2 - Salvacion del Doctor

- Si al menos un Doctor eligio al objetivo mafioso final, ese jugador sobrevive automaticamente.
- Esta salvacion tiene prioridad total sobre cualquier otra regla de resolucion.

### Paso 3 - Rezo ciudadano

- Solo se evalua si el Doctor no salvo al objetivo mafioso final.
- Se cuentan los Ciudadanos vivos al comenzar la resolucion.
- Si al menos `ceil(ciudadanos vivos / 2)` rezaron por el objetivo mafioso final, se hace un sorteo 50/50 entre `vive` y `muere`.

### Paso 4 - Resultado publico

- Si el objetivo muere, el mensaje publico es `Murio {{nombre}}`.
- Si sobrevive, el mensaje publico es `Nadie murio`.
- El mensaje publico no revela si hubo salvacion del Doctor, rezo ciudadano ni como votaron los mafias.

## Fase de dia

- La fase de dia no modela votos detallados.
- El grupo solo puede elegir entre ejecutar a alguien o pasar a la noche.
- Si ejecuta a alguien, debe seleccionar un jugador vivo.
- La ejecucion aplica inmediatamente y luego se valida fin de partida.

## Condiciones de victoria

- Ganan los Ciudadanos cuando no quedan mafias vivos.
- Ganan los Mafias cuando la cantidad de mafias vivos es mayor o igual a la de no-mafias vivos.

## Historial final

Al final de la partida debe mostrarse:

- el ganador;
- el estado final de cada jugador;
- cada ronda en orden cronologico;
- los objetivos elegidos por cada rol;
- el objetivo mafioso final resuelto;
- si el Doctor salvo o no;
- si hubo umbral de rezo ciudadano;
- el resultado del sorteo 50/50 cuando aplique;
- muertes nocturnas y ejecuciones diurnas.

## Regla de visibilidad

- Durante la partida solo se muestra informacion publica segura o informacion privada del jugador activo.
- La informacion oculta de la noche queda reservada para el historial final.
- Antes de cada vista privada debe existir una instancia neutra de pase del celular sin informacion secreta visible.
