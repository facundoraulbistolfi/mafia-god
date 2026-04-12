# Specs

Esta carpeta concentra la definicion funcional del producto.
El repositorio se desarrolla siempre de forma `spec driven`: primero se define o actualiza la especificacion y despues se implementa.

## Politica de trabajo

- `Specs/` es la fuente de verdad funcional del proyecto.
- `product-scope.md` es transversal y no versionado.
- Cada version funcional vive en su propia carpeta `Specs/<version>/`.
- La version activa actual es [0.0.1](0.0.1/README.md).
- Cada version debe declarar su estado: `wip` o `closed`.
- Una version `wip` puede seguir refinandose dentro de su carpeta.
- Una version `closed` no recibe cambios de comportamiento: esos cambios van a una nueva carpeta de version.
- Si una version fija una direccion visual explicita, debe incluir `visual-guide.md`.

## Estructura esperada

```text
Specs/
  product-scope.md
  0.0.1/
    README.md
    mvp.md
    game-rules.md
    use-cases.md
    visual-guide.md
  <future-version>/
    README.md
    mvp.md
    game-rules.md
    use-cases.md
    changes-from-previous.md
    visual-guide.md
```

## Orden de lectura

1. [product-scope.md](product-scope.md)
2. [0.0.1/README.md](0.0.1/README.md)
3. [0.0.1/mvp.md](0.0.1/mvp.md)
4. [0.0.1/game-rules.md](0.0.1/game-rules.md)
5. [0.0.1/use-cases.md](0.0.1/use-cases.md)
6. [0.0.1/ux-look-and-feel.md](0.0.1/ux-look-and-feel.md)
7. [0.0.1/visual-guide.md](0.0.1/visual-guide.md)

## Regla de cambio

Si una tarea entra en conflicto con estos documentos, no se implementa directamente.
Primero se actualizan los specs y se deja explicito si el cambio pertenece a la version activa o a una nueva version.
