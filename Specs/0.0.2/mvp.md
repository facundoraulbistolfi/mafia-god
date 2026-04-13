# MVP 0.0.2

## Resumen

La version `0.0.2` mantiene el MVP jugable de `0.0.1` y mejora el setup para que la configuracion inicial requiera menos lectura, menos precision motriz y menos interpretacion en una pantalla chica.
Tambien suma una pista visual puntual en la noche para que la Mafia vea mejor el consenso parcial ya emitido y mejora el copy/legibilidad del tramo publico de amanecer y dia.

## Regla general

El setup sigue siendo un flujo publico y mobile first.
La app debe dejar claro:

- cuanta gente falta para empezar;
- cual es la accion principal en cada paso;
- que orden de mesa se esta configurando;
- cuando la mesa ya esta lista para pasar al reparto.

## Paso 1 - Jugadores

### Objetivo

Cargar nombres y orden de mesa de forma rapida y tactil.

### Reglas del flujo

1. El setup arranca con un unico jugador vacio.
2. Los jugadores se agregan uno por uno.
3. Cada fila muestra numero de orden, nombre editable y acciones de mover o quitar.
4. En mobile, el reordenamiento se resuelve primero con acciones explicitas `subir` y `bajar`.
5. El drag puede seguir existiendo como mejora secundaria, pero no es la interaccion principal.
6. `Siguiente` permanece deshabilitado hasta llegar a 4 jugadores y completar todos los nombres.
7. `Modo demo` se mantiene como CTA secundario y no debe competir con el alta manual.
8. Si la persona vuelve al setup desde una partida pausada o cerrada, la app puede precargar la ultima mesa confirmada para acelerar otra partida con el mismo grupo.
9. `Borrar todo` limpia la mesa recordada y devuelve el setup a un unico jugador vacio.

### Resultado esperado

- la persona organizadora entiende el estado de la mesa de un vistazo;
- el alta de jugadores se puede hacer con una mano;
- el orden se corrige sin depender de drag & drop;
- la accion principal para avanzar queda siempre clara;
- rearmar una mesa conocida no obliga a reescribir todos los nombres.

## Paso 2 - Roles

### Objetivo

Confirmar el reparto sin perder contexto del grupo ya cargado.

### Reglas del flujo

1. El paso se abre solo despues de completar el setup de jugadores.
2. El resumen del grupo debe seguir visible, pero de forma compacta en mobile.
3. El reparto sugerido se mantiene precargado segun la cantidad de jugadores.
4. Los steppers de roles siguen siendo el foco principal de la pantalla.
5. No se agrega una status card extra arriba del paso: la validacion vive en el contador, los errores inline y el CTA deshabilitado.
6. `Iniciar partida` sigue bloqueado si el reparto es invalido.
7. `Volver a jugadores` sigue disponible como accion secundaria.

### Resultado esperado

- se entiende rapido si el reparto cierra o no;
- el resumen del grupo no empuja demasiado abajo a los steppers;
- el CTA de inicio conserva la maxima jerarquia.

## Ajuste puntual - Turno privado de Mafia

### Objetivo

Hacer mas legible la coordinacion mafiosa cuando hay mas de un mafia vivo, sin agregar informacion nueva ni tocar la resolucion de la ronda.

### Reglas del flujo

1. En el turno privado de un mafia, cada target puede mostrar un cuchillo por cada mafia anterior que ya lo eligio en esa misma noche.
2. La señal solo toma acciones mafiosas ya registradas antes de ese turno.
3. La señal no cambia targets permitidos, prioridad de acciones ni resolucion ponderada de la noche.
4. La pista solo aparece en el turno privado de la Mafia y no se muestra a otros roles.

### Resultado esperado

- un mafia entiende de un vistazo si ya existe consenso parcial;
- la coordinacion mejora sin exponer informacion nueva al resto;
- la noche conserva exactamente las mismas reglas de `0.0.1`.

## Ajuste puntual - Amanecer y dia

### Objetivo

Hacer que el tramo publico posterior a la noche se lea mejor en celular y tenga un tono mas variado, absurdo y memorable sin cambiar ningun comportamiento.

### Reglas del flujo

1. Los resultados de muerte usan redaccion unisex y no dependen del genero del nombre mostrado.
2. Los textos publicos de muerte deben tener al menos 10 variantes.
3. Los textos publicos de noches sin victimas tambien deben tener al menos 10 variantes.
4. El formato de muerte se mantiene como `nombre + frase`; los textos de no-muerte siguen siendo frases completas.
5. `Pasar a la noche` pasa a mostrarse como `Pasar a la noche sin ejecutar a nadie`.
6. El banner de amanecer gana jerarquia tipografica y contraste para soportar textos mas largos en mobile.

### Resultado esperado

- el resultado principal se entiende de un vistazo;
- el copy evita marcas de genero que rompan con nombres femeninos;
- el tramo publico conserva claridad, pero con mas variedad y personalidad.
