# Visual Guide 0.0.2

## Direccion

El setup de `0.0.2` usa una estetica de `expediente suave`.
No busca convertir toda la app en una UI nueva, sino volver mas legible el armado de la mesa y el tramo publico de la ronda con un lenguaje visual consistente.

## Principios

- una sola columna en mobile;
- estado general visible arriba;
- una sola accion principal por pantalla;
- acciones secundarias presentes pero mas silenciosas;
- filas de jugadores con targets tactiles claros;
- menos densidad en el resumen del paso `Roles`.

## Jugadores

- status card arriba con borde izquierdo y mensaje corto;
- lista de jugadores como pila de piezas tactiles;
- numero de orden visible;
- acciones `subir`, `bajar`, `quitar` faciles de tocar;
- `Borrar todo` como accion de limpieza visible pero silenciosa dentro del sheet;
- `Agregar jugador` dentro del flujo de carga;
- `Siguiente` como CTA principal fijo y reconocible;
- `🎭 DEMO` como CTA secundaria.

## Roles

- resumen del grupo comprimido y expandible si hace falta;
- steppers con jerarquia dominante;
- validacion del reparto resuelta sin bloque redundante arriba;
- `Iniciar partida` arriba del resto de acciones;
- `← Volver a jugadores` como accion de retroceso, no como CTA competidora.

## Modales

- ningun modal muestra cruz de cierre;
- cada salida se resuelve con un CTA explicito dentro del modal;
- en reveal privado, la salida se resuelve solo con `Cerrar y pasar...` o `Cerrar y empezar la noche`;
- en confirmaciones y reglas, el cierre vive en acciones como `Cancelar`, `Cerrar` o el CTA principal correspondiente.

## Turno privado de Mafia

- la lista de targets sigue siendo el foco principal;
- cada target puede sumar un grupo compacto de `🔪` cuando ya fue elegido por mafias previas;
- los cuchillos viven en la banda lateral del target y no compiten con el nombre;
- la pista es privada y solo aparece en el turno de la Mafia.

## Amanecer

- el resultado de la noche es el foco visual absoluto;
- el texto principal sube de tamaño para bancarse frases mas largas en mobile;
- el subtitulo de reunion gana contraste y aire para no perderse debajo del resultado;
- el CTA secundario explicita que saltar la ejecucion lleva a la noche sin ejecutar a nadie.
