import type { GamePhase, PrivateInspectionResult, Role, Winner } from './types';

export const ROLE_LABELS: Record<Role, string> = {
  mafia: 'Mafia',
  police: 'Policia',
  doctor: 'Doctor',
  citizen: 'Ciudadano',
};

export const ROLE_ACTION_LABELS: Record<Role, string> = {
  mafia: '¿A quién querés atacar?',
  police: '¿A quién querés investigar?',
  doctor: '¿A quién querés salvar?',
  citizen: '¿Por quién querés rezar?',
};

export const ROLE_HELP_TEXT: Record<Role, string> = {
  mafia: 'No podes elegirte ni elegir a otro mafia.',
  police: 'Solo podes inspeccionar a otro jugador vivo.',
  doctor: 'Podes salvar a cualquier jugador vivo, incluso a vos.',
  citizen: 'Podes rezar por cualquier jugador vivo, incluso por vos.',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  mafia: 'Actuas de noche y votas a quien eliminar sin narrador.',
  police: 'Inspeccionas a otro jugador y ves si es Mafia o no.',
  doctor: 'Intentas salvar al objetivo elegido por la Mafia.',
  citizen: 'Rezas para activar la chance extra de supervivencia.',
};

export const PRIVATE_RESULT_LABELS: Record<PrivateInspectionResult, string> = {
  'is-mafia': 'ES MAFIA 🔪',
  'not-mafia': 'NO ES MAFIA ✅',
};

export const WINNER_LABELS: Record<Winner, string> = {
  citizens: 'GANAN LOS CIUDADANOS',
  mafia: 'GANA LA MAFIA',
};

// Emoji map per role — used throughout the UI
export const ROLE_EMOJI: Record<Role, string> = {
  mafia: '🔪',
  police: '🔍',
  doctor: '💉',
  citizen: '🙏',
};

// Emoji map per GamePhase — used in rail badges
export const PHASE_EMOJI: Record<GamePhase, string> = {
  setup: '📋',
  briefing: '📖',
  'role-reveal': '🎭',
  night: '🌙',
  'round-resolution': '⚡', // Placeholder; UI shows '💀' or '🛡️' based on outcome
  day: '☀️',
  'game-over': '🏆',
};

// Death/resolution flavor texts — selected randomly each night
export const DEATH_FLAVOR_TEXTS: string[] = [
  'aparecio con 27 punaladas en la espalda y una nota de suicidio.',
  'se tropezo con una bala.',
  'ya esta tocando el arpa, y no en una orquesta.',
  'quedo fuera de servicio antes del desayuno.',
  'recibio una auditoria nocturna demasiado definitiva.',
  'perdio la conexion con el servidor de la vida.',
  'se cruzo con la version full contact de la mala suerte.',
  'paso a ser recuerdo con una eficiencia admirable.',
  'termino en la carpeta de casos cerrados.',
  'descubrio demasiado tarde que la noche venia con contenido sensible.',
];

export const NO_DEATH_FLAVOR_TEXTS: string[] = [
  'Nadie cayo. La mafia tuvo peor punteria que un stormtrooper.',
  'Todos siguen vivos. Sospechoso, pero vivos.',
  'La noche termino sin bajas y con mucho chamuyo pendiente.',
  'Nadie paso a mejor vida. Todavia.',
  'La mafia no concreto nada. Capaz habia paro nocturno.',
  'El pueblo amanecio entero, para desgracia de los chismosos.',
  'No hubo victimas. Al menos no oficialmente.',
  'La madrugada no se llevo a nadie. Increible, pero legal.',
  'Todos llegaron al amanecer con pulso y ganas de acusar.',
  'Nadie murio. La tragedia prefirio mirar desde la tribuna.',
];

export const TOWN_GATHERING_TEXTS: string[] = [
  'El pueblo se reúne en la plaza central para deliberar.',
  'Los vecinos se juntan frente a la municipalidad.',
  'Todos se encuentran en la taberna para discutir lo ocurrido.',
  'La comunidad se congrega al pie de la iglesia.',
  'El pueblo entero se reúne junto a la fuente principal.',
];

// Briefing slide content — 4 slides for the pre-game tutorial
export const BRIEFING_SLIDES: Array<{
  emoji: string;
  title: string;
  body: string;
}> = [
  {
    emoji: '📱',
    title: 'Un teléfono, muchos secretos',
    body: 'El teléfono pasa de mano en mano. Las pantallas con borde rojo son solo para quien tenga el teléfono en ese momento.',
  },
  {
    emoji: '🎭',
    title: 'Los roles',
    body: '🔪 Mafia ataca de noche. 🔍 Policía investiga. 💉 Doctor salva. 🙏 Ciudadano reza. Solo la Mafia conoce a sus cómplices.',
  },
  {
    emoji: '🌙☀️',
    title: 'Noche y día',
    body: 'De noche cada uno actúa en secreto. De día todos hablan y deciden a quién ejecutar.',
  },
  {
    emoji: '🏆',
    title: '¿Cómo se gana?',
    body: 'Ciudadanos ganan si eliminan a toda la Mafia. Mafia gana si iguala en número a los no-Mafia vivos.',
  },
];
