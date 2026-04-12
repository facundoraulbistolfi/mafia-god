# Visual Guide 0.0.1

## Estado

- Estado actual: `done`

## Rol de este documento

Este documento resume la dirección visual de `0.0.1`.
La especificación canónica de experiencia y look and feel vive en [ux-look-and-feel.md](ux-look-and-feel.md).
Si hay conflicto entre ambos, manda `ux-look-and-feel.md`.

## Dirección visual resumida

- estética general: `Expediente Policial` — dossier monospace, papel oscuro, sellos confidenciales;
- tipografía: `'Courier New', 'Courier', monospace` única familia, todo uppercase en títulos y botones;
- iconografía: emojis nativos del sistema (sin SVGs custom);
- señalización de fases: `muy marcada` — noche azul frío, día verde oliva;
- señalización de modo: borde izquierdo de 4px (verde público, dorado pase, rojo privado);
- prioridad absoluta: claridad mobile first, privacidad y ritmo de mesa.

## Paleta de colores

### Base
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#12100c` | Fondo base (papel oscuro) |
| `--text` | `#e8e0d0` | Texto principal |
| `--text-muted` | `#8b7b65` | Texto secundario |
| `--text-label` | `#c8b890` | Labels, kickers, metadata |

### Fase: Noche
| Token | Valor |
|-------|-------|
| `--night-bg` | `linear-gradient(180deg, #0c0e16, #080a12)` |
| `--night-accent` | `#8ea4cc` |
| `--night-text` | `#e0e8f4` |

### Fase: Día
| Token | Valor |
|-------|-------|
| `--day-bg` | `linear-gradient(180deg, #121610, #0e120a)` |
| `--day-accent` | `#90b060` |
| `--day-text` | `#d8ecc0` |

### Modos de pantalla
| Modo | Border-left | Emoji |
|------|-------------|-------|
| Público | `4px solid rgba(140, 165, 140, 0.5)` | `🔓` |
| Pase | `4px solid #c8aa64` | `📱` |
| Privado | `4px solid #c43030` | `🔒` |

## Tipografía

- **Única familia**: `'Courier New', 'Courier', monospace`
- Títulos de fase: 24-28px, 700, uppercase, letter-spacing 2-3px
- Kickers: 9-10px, 700, uppercase, letter-spacing 2-3px
- Body: 12-13px, 400, color muted
- Botones: 12-13px, 700, uppercase, letter-spacing 1px

## Iconografía (emojis por rol)

| Rol | Emoji |
|-----|-------|
| Mafia | `🔪` |
| Policía | `🔍` |
| Doctor | `💉` |
| Ciudadano | `🙏` |

## Iconografía (emojis por fase)

| Fase | Emoji |
|------|-------|
| Setup | `📋` |
| Briefing | `📖` |
| Revelación | `🎭` |
| Noche | `🌙` |
| Resolución | `💀` / `🛡️` |
| Día | `☀️` |
| Game Over | `🏆` |

## Elementos de estética "Expediente"

- **Borde izquierdo de modo**: indicador principal de quién puede mirar.
- **Sello CONFIDENCIAL**: border rojo, uppercase, letter-spacing, en pantallas privadas.
- **Pestaña de carpeta**: `.folder-tab` en esquina superior derecha con metadata.
- **Handle drag `≡`**: para reordenar jugadores en setup.
- **Botón `📖`**: en top rail post-setup, abre modal de reglas.

## Fases y colores de activación

Las fases activan colores via `data-phase` en el `.scene`:
- `[data-phase="night"]` → variables `--night-*`
- `[data-phase="day"]` → variables `--day-*`
- Resto → variables base

Los modos activan borde via `data-screen-mode`:
- `[data-screen-mode="handoff"]` → `border-left: 4px solid #c8aa64`
- `[data-screen-mode="private"]` → `border-left: 4px solid #c43030`
- `[data-screen-mode="public"]` → `border-left: 4px solid rgba(140,165,140,0.5)`

## Checklist visual rápido

Una pantalla cumple la guía si:

- se entiende en unos pocos segundos;
- no obliga a leer de más;
- deja claro si es segura o privada (borde izquierdo inmediato);
- conserva targets amplios y jerarquía mobile first;
- el emoji de fase/rol es visible y legible;
- monospace en toda la tipografía.
