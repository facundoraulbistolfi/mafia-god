import { DEATH_FLAVOR_TEXTS, NO_DEATH_FLAVOR_TEXTS, PRIVATE_RESULT_LABELS, TOWN_GATHERING_TEXTS } from './labels';
import type {
  GameResult,
  NightAction,
  NightState,
  Player,
  PrivateInspectionResult,
  Role,
  RoleCounts,
  RoundRecord,
  SetupState,
  SetupValidation,
  Winner,
} from './types';
import type { Rng } from './rng';

export const DEFAULT_PLAYER_COUNT = 1;

export function suggestRoleCounts(playerCount: number): RoleCounts {
  const mafia = Math.max(1, Math.floor(playerCount / 4));
  const police = 1;
  const doctor = 1;
  const citizen = Math.max(1, playerCount - mafia - police - doctor);

  return {
    mafia,
    police,
    doctor,
    citizen,
  };
}

export function createInitialSetup(playerCount = DEFAULT_PLAYER_COUNT): SetupState {
  return {
    playerCount,
    playerNames: Array.from({ length: playerCount }, () => ''),
    roleCounts: suggestRoleCounts(playerCount),
  };
}

export function resizePlayerNames(playerNames: string[], playerCount: number) {
  return Array.from({ length: playerCount }, (_, index) => playerNames[index] ?? '');
}

export function validateSetup(setup: SetupState): SetupValidation {
  const playerNameErrors: Record<number, string> = {};
  const roleErrors: string[] = [];

  if (setup.playerCount < 4) {
    return {
      isValid: false,
      playerCountError: 'Se necesitan al menos 4 jugadores.',
      playerNameErrors,
      roleErrors,
    };
  }

  const normalizedNames = setup.playerNames.slice(0, setup.playerCount).map((name) => name.trim());
  normalizedNames.forEach((name, index) => {
    if (!name) {
      playerNameErrors[index] = 'El nombre no puede estar vacio.';
    }
  });

  const totalRoles =
    setup.roleCounts.mafia +
    setup.roleCounts.police +
    setup.roleCounts.doctor +
    setup.roleCounts.citizen;

  if (totalRoles !== setup.playerCount) {
    roleErrors.push('La suma de roles debe coincidir con la cantidad de jugadores.');
  }

  if (setup.roleCounts.mafia < 1) {
    roleErrors.push('Debe haber al menos 1 Mafia.');
  }

  if (setup.roleCounts.police < 1) {
    roleErrors.push('Debe haber al menos 1 Policia.');
  }

  if (setup.roleCounts.doctor < 1) {
    roleErrors.push('Debe haber al menos 1 Doctor.');
  }

  if (setup.roleCounts.citizen < 1) {
    roleErrors.push('Debe haber al menos 1 Ciudadano.');
  }

  return {
    isValid:
      !Object.keys(playerNameErrors).length &&
      !roleErrors.length &&
      typeof setup.playerCount === 'number',
    playerNameErrors,
    roleErrors,
  };
}

export function buildPlayers(setup: SetupState, rng: Rng): Player[] {
  const normalizedNames = setup.playerNames.slice(0, setup.playerCount).map((name) => name.trim());
  const roles = shuffle(createRolePool(setup.roleCounts), rng);

  return normalizedNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    role: roles[index],
    status: 'alive',
    order: index,
  }));
}

export function createNightState(players: Player[], round: number): NightState {
  return {
    round,
    step: 'intro',
    actorOrder: buildNightTurnOrder(players),
    currentTurnIndex: 0,
    actions: [],
  };
}

export function buildNightTurnOrder(players: Player[]) {
  return players
    .filter((player) => player.status === 'alive')
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((player) => player.id);
}

export function getAllowedTargets(actor: Player, players: Player[]) {
  const livingPlayers = players
    .filter((player) => player.status === 'alive')
    .slice()
    .sort((left, right) => left.order - right.order);

  switch (actor.role) {
    case 'police':
      return livingPlayers.filter((player) => player.id !== actor.id);
    case 'doctor':
      return livingPlayers;
    case 'mafia':
      return livingPlayers.filter((player) => player.id !== actor.id && player.role !== 'mafia');
    case 'citizen':
      return livingPlayers;
    default:
      return livingPlayers;
  }
}

export function createNightAction(actor: Player, target: Player, round: number): NightAction {
  const action: NightAction = {
    actorId: actor.id,
    role: actor.role,
    targetId: target.id,
    round,
  };

  const inspectionResult = getInspectionResult(actor, target);
  if (inspectionResult) {
    action.privateResult = inspectionResult;
  }

  return action;
}

export function getInspectionResult(
  actor: Player,
  target: Player,
): PrivateInspectionResult | null {
  if (actor.role !== 'police') {
    return null;
  }

  return target.role === 'mafia' ? 'is-mafia' : 'not-mafia';
}

export function resolveNightRound(
  players: Player[],
  actions: NightAction[],
  round: number,
  rng: Rng,
) {
  const mafiaActions = actions.filter((action) => action.role === 'mafia');
  const mafiaTargetId = resolveWeightedTarget(mafiaActions, rng);
  const doctorSaved = mafiaTargetId
    ? actions.some((action) => action.role === 'doctor' && action.targetId === mafiaTargetId)
    : false;

  const livingCitizens = players.filter(
    (player) => player.status === 'alive' && player.role === 'citizen',
  ).length;
  const citizenPrayerThreshold = livingCitizens ? Math.ceil(livingCitizens / 2) : 0;
  const citizenPrayerCount = mafiaTargetId
    ? actions.filter((action) => action.role === 'citizen' && action.targetId === mafiaTargetId).length
    : 0;

  let citizenPrayerTriggered = false;
  let citizenPrayerSaved: boolean | null = null;

  if (
    mafiaTargetId &&
    !doctorSaved &&
    citizenPrayerThreshold > 0 &&
    citizenPrayerCount >= citizenPrayerThreshold
  ) {
    citizenPrayerTriggered = true;
    citizenPrayerSaved = rng.next() < 0.5;
  }

  const shouldDie =
    mafiaTargetId !== null &&
    !doctorSaved &&
    !(citizenPrayerTriggered && citizenPrayerSaved === true);
  const nightDeathPlayerId = shouldDie ? mafiaTargetId : null;
  const updatedPlayers = nightDeathPlayerId ? eliminatePlayer(players, nightDeathPlayerId) : players;

  const deathFlavorIndex = Math.floor(
    rng.next() * (nightDeathPlayerId ? DEATH_FLAVOR_TEXTS.length : NO_DEATH_FLAVOR_TEXTS.length),
  );
  const gatheringFlavorIndex = Math.floor(rng.next() * TOWN_GATHERING_TEXTS.length);

  const publicMessage = nightDeathPlayerId
    ? `${getPlayerName(updatedPlayers, nightDeathPlayerId)} ${DEATH_FLAVOR_TEXTS[deathFlavorIndex]}`
    : NO_DEATH_FLAVOR_TEXTS[deathFlavorIndex];

  const roundRecord: RoundRecord = {
    round,
    nightActions: actions,
    mafiaTargetId,
    doctorSaved,
    citizenPrayerThreshold,
    citizenPrayerCount,
    citizenPrayerTriggered,
    citizenPrayerSaved,
    nightDeathPlayerId,
    publicMessage,
    dayExecutionPlayerId: null,
    deathFlavorIndex,
    gatheringFlavorIndex,
  };

  return {
    updatedPlayers,
    roundRecord,
  };
}

export function applyDayExecution(players: Player[], playerId: string) {
  return eliminatePlayer(players, playerId);
}

export function attachDayExecution(rounds: RoundRecord[], playerId: string) {
  if (!rounds.length) {
    return rounds;
  }

  return rounds.map((roundRecord, index) => {
    if (index !== rounds.length - 1) {
      return roundRecord;
    }

    return {
      ...roundRecord,
      dayExecutionPlayerId: playerId,
    };
  });
}

export function evaluateWinner(players: Player[]): Winner | null {
  const livingPlayers = players.filter((player) => player.status === 'alive');
  const livingMafias = livingPlayers.filter((player) => player.role === 'mafia').length;
  const livingNonMafias = livingPlayers.length - livingMafias;

  if (livingMafias === 0) {
    return 'citizens';
  }

  if (livingMafias >= livingNonMafias) {
    return 'mafia';
  }

  return null;
}

export function buildGameResult(
  winner: Winner,
  players: Player[],
  rounds: RoundRecord[],
): GameResult {
  return {
    winner,
    finalPlayers: players,
    rounds,
  };
}

export function getPlayerById(players: Player[], playerId: string) {
  return players.find((player) => player.id === playerId) ?? null;
}

export function getPlayerName(players: Player[], playerId: string | null) {
  if (!playerId) {
    return 'Nadie';
  }

  return getPlayerById(players, playerId)?.name ?? 'Jugador desconocido';
}

export function getNightActionSummary(action: NightAction, players: Player[]) {
  const actor = getPlayerById(players, action.actorId);
  const target = getPlayerById(players, action.targetId);
  const base = `${actor?.name ?? 'Jugador'} eligio a ${target?.name ?? 'alguien'}`;

  if (action.privateResult) {
    return `${base}. Resultado: ${PRIVATE_RESULT_LABELS[action.privateResult]}.`;
  }

  return base;
}

export function getNightTargetSelectionCounts(actions: NightAction[], role: Role) {
  const counts = new Map<string, number>();

  actions.forEach((action) => {
    if (action.role !== role) {
      return;
    }

    counts.set(action.targetId, (counts.get(action.targetId) ?? 0) + 1);
  });

  return counts;
}

function createRolePool(roleCounts: RoleCounts) {
  return (Object.entries(roleCounts) as Array<[Role, number]>).flatMap(([role, count]) =>
    Array.from({ length: count }, () => role),
  );
}

function shuffle<T>(items: T[], rng: Rng) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng.next() * (index + 1));
    const current = clone[index];
    clone[index] = clone[swapIndex];
    clone[swapIndex] = current;
  }

  return clone;
}

function resolveWeightedTarget(actions: NightAction[], rng: Rng) {
  if (!actions.length) {
    return null;
  }

  const weights = new Map<string, number>();
  actions.forEach((action) => {
    weights.set(action.targetId, (weights.get(action.targetId) ?? 0) + 1);
  });

  const totalWeight = Array.from(weights.values()).reduce((total, weight) => total + weight, 0);
  let remaining = rng.next() * totalWeight;

  for (const [playerId, weight] of weights.entries()) {
    remaining -= weight;
    if (remaining < 0) {
      return playerId;
    }
  }

  return actions[actions.length - 1]?.targetId ?? null;
}

function eliminatePlayer(players: Player[], playerId: string) {
  return players.map<Player>((player) =>
    player.id === playerId
      ? {
          ...player,
          status: 'dead',
        }
      : player,
  );
}
