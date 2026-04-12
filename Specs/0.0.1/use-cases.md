# Use Cases 0.0.1

## Actores

- Persona que configura la partida
- Jugador activo que tiene el celular
- Grupo de jugadores

## UC-01 - Configurar una partida completa

La persona que organiza la partida agrega jugadores uno por uno, define el orden circular y confirma un reparto de roles valido en un segundo paso.

Resultado esperado:
- la partida queda lista para asignar roles;
- el boton `Siguiente` solo se habilita cuando el grupo ya cumple el minimo para jugar;
- el paso de roles aparece con un reparto sugerido precargado;
- el reparto coincide con la cantidad de jugadores;
- el flujo se puede hacer desde un celular sin pasos innecesarios.

## UC-02 - Revelar roles sin cartas y con pase guiado

El grupo se pasa el celular y cada jugador ve su rol de manera privada desde la pantalla `Pasar al jugador {{nombre}}`.

Resultado esperado:
- cada jugador solo ve su informacion;
- la Mafia puede conocer a los otros mafias;
- al cerrar el modal no queda informacion secreta visible;
- la accion de cierre indica a quien se le pasa el celular o que empieza la noche.

## UC-03 - Resolver una noche completa sin narrador

Cada jugador vivo recibe una pantalla neutra de pase antes de ver sus acciones nocturnas.

Resultado esperado:
- el orden de juego se respeta;
- antes de cada accion privada queda claro a quien pasarle el celular;
- las acciones nocturnas se registran correctamente;
- el flujo puede hacerse con todos los demas jugadores con los ojos cerrados.

## UC-04 - Comunicar el resultado publico de la ronda

Cuando termina la noche, la app calcula el desenlace y comunica si murio alguien o si nadie murio.

Resultado esperado:
- el resultado publico es claro;
- la app no filtra informacion oculta;
- la partida puede continuar a la fase de dia o cerrarse si ya termino.

## UC-05 - Resolver la decision del dia

Durante el dia, el grupo decide ejecutar a alguien o pasar directamente a la siguiente noche.

Resultado esperado:
- la interfaz mantiene una decision simple;
- si se ejecuta a alguien, solo pueden elegirse jugadores vivos;
- despues de la decision se verifica el fin de partida.

## UC-06 - Cerrar la partida con historial completo

Cuando se cumple una condicion de victoria, la app declara ganador y libera toda la informacion reservada de la partida.

Resultado esperado:
- se muestra quien gano;
- se entiende el estado final del grupo;
- el historial permite revisar que paso en cada ronda.

## UC-07 - Iniciar una demo fija para recorrer la app

La persona que organiza puede tocar `Modo demo` desde la configuracion, revisar el preset y confirmar el arranque para saltar el ingreso manual y abrir una partida preset.

Resultado esperado:
- la app crea una partida con el elenco demo de 8 jugadores;
- cada jugador recibe el rol fijo definido por la spec;
- el flujo entra directo en la revelacion privada de roles;
- la demo respeta el mismo recorrido que una partida normal una vez iniciada.
