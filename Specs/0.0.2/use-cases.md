# Use Cases 0.0.2

## UC-01 - Configurar la mesa desde el celular sin friccion

La persona que organiza carga y ordena los jugadores usando una interfaz pensada para toque, sin depender de gestos finos ni lectura excesiva.

Resultado esperado:

- entiende de inmediato si faltan jugadores o nombres;
- puede agregar jugadores uno por uno;
- puede reordenar la mesa con acciones claras de `subir` y `bajar`;
- reconoce facilmente cual es el CTA principal para avanzar.

## UC-02 - Revisar roles sin perder contexto del grupo

Despues de tocar `Siguiente`, la persona ve el reparto sugerido y un resumen compacto del grupo ya cargado.

Resultado esperado:

- el orden de la mesa sigue accesible;
- el reparto sugerido se entiende de un vistazo;
- el CTA `Iniciar partida` sigue dominando;
- volver al paso anterior es simple y visible.

## UC-03 - Mantener el atajo de demo sin competir con el setup manual

La persona puede abrir `Modo demo` desde el setup si quiere saltar el ingreso manual.

Resultado esperado:

- el demo sigue disponible;
- aparece con confirmacion contextual;
- no se percibe como la accion principal del setup;
- al cancelarlo se vuelve al flujo manual sin cambios.

## UC-04 - Leer el consenso parcial mafioso sin cambiar las reglas

Cuando hay mas de un mafia vivo, cada mafia que actua despues puede ver sobre los targets un cuchillo por cada mafia anterior que ya los marco.

Resultado esperado:

- la Mafia coordina mejor sin hablar;
- la pista solo reutiliza informacion privada ya emitida en esa misma noche;
- la resolucion ponderada sigue siendo la misma.

## UC-05 - Rearmar una mesa conocida sin volver a cargar todos los nombres

Cuando la persona vuelve al setup desde una partida pausada o despues de cerrar una partida, la app puede precargar la ultima mesa confirmada para acelerar una nueva vuelta con el mismo grupo.

Resultado esperado:

- la app evita recargar nombres desde cero si la mesa no cambio;
- el cold start sigue arrancando con un unico jugador vacio;
- `Borrar todo` devuelve el setup a un solo jugador vacio y limpia esa mesa recordada.

## UC-06 - Entender el amanecer de un vistazo y decidir el siguiente paso

Despues de la noche, el grupo ve un banner publico mas legible, con copy unisex y un CTA secundario que deja explicito que puede pasar a la noche sin ejecutar a nadie.

Resultado esperado:

- el resultado principal se entiende rapido en mobile;
- las frases de muerte y no-muerte mantienen claridad sin depender del genero del nombre;
- la decision entre ejecutar o seguir sin ejecucion queda explicita.
