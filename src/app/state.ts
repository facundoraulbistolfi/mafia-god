import {
  applyDayExecution,
  attachDayExecution,
  buildGameResult,
  buildNightTurnOrder,
  buildPlayers,
  createInitialSetup,
  createNightAction,
  createNightState,
  evaluateWinner,
  getAllowedTargets,
  getPlayerById,
  resizePlayerNames,
  resolveNightRound,
  suggestRoleCounts,
} from '../domain/game';
import { createDemoPlayers, createDemoSetup } from '../domain/demo';
import type { Rng } from '../domain/rng';
import type {
  GamePhase,
  GameResult,
  NightState,
  Player,
  Role,
  RoundRecord,
  SetupState,
} from '../domain/types';

const BRIEFING_SLIDE_COUNT = 4;

export interface AppState {
  phase: GamePhase;
  setupStep: 'players' | 'roles';
  setup: SetupState;
  players: Player[];
  revealIndex: number;
  briefingSlide: number;
  night: NightState | null;
  rounds: RoundRecord[];
  gameResult: GameResult | null;
}

export type GameAction =
  | { type: 'setup/add-player' }
  | { type: 'setup/remove-player'; index: number }
  | { type: 'setup/advance' }
  | { type: 'setup/set-player-name'; index: number; name: string }
  | { type: 'setup/move-player'; index: number; direction: -1 | 1 }
  | { type: 'setup/reorder-player'; fromIndex: number; toIndex: number }
  | { type: 'setup/set-role-count'; role: Role; value: number }
  | { type: 'setup/back' }
  | { type: 'game/start'; rng: Rng }
  | { type: 'game/start-demo' }
  | { type: 'briefing/next' }
  | { type: 'briefing/skip' }
  | { type: 'reveal/advance' }
  | { type: 'night/start-turns' }
  | { type: 'night/submit-action'; targetId: string; rng: Rng }
  | { type: 'night/advance-handoff' }
  | { type: 'resolution/continue' }
  | { type: 'resolution/skip-to-night' }
  | { type: 'day/execute'; playerId: string }
  | { type: 'day/pass' }
  | { type: 'setup/clear-all-players' }
  | { type: 'game/reset'; savedPlayers?: string[] };

export function createInitialAppState(): AppState {
  return {
    phase: 'setup',
    setupStep: 'players',
    setup: createInitialSetup(),
    players: [],
    revealIndex: 0,
    briefingSlide: 0,
    night: null,
    rounds: [],
    gameResult: null,
  };
}

export function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'setup/add-player': {
      if (state.setup.playerCount >= 20) {
        return state;
      }

      const playerCount = state.setup.playerCount + 1;
      const playerNames = resizePlayerNames(state.setup.playerNames, playerCount);

      return {
        ...state,
        setup: {
          ...state.setup,
          playerCount,
          playerNames,
          roleCounts: suggestRoleCounts(playerCount),
        },
      };
    }

    case 'setup/remove-player': {
      if (state.setup.playerCount <= 1) {
        return state;
      }

      const playerNames = state.setup.playerNames.filter((_, index) => index !== action.index);
      const playerCount = playerNames.length;

      return {
        ...state,
        setup: {
          ...state.setup,
          playerCount,
          playerNames,
          roleCounts: suggestRoleCounts(playerCount),
        },
      };
    }

    case 'setup/advance': {
      if (!canAdvanceSetupPlayers(state.setup)) {
        return state;
      }

      return {
        ...state,
        setupStep: 'roles',
      };
    }

    case 'setup/back': {
      if (state.setupStep !== 'roles') {
        return state;
      }

      return {
        ...state,
        setupStep: 'players',
      };
    }

    case 'setup/set-player-name': {
      const playerNames = [...state.setup.playerNames];
      playerNames[action.index] = action.name;

      return {
        ...state,
        setup: {
          ...state.setup,
          playerNames,
        },
      };
    }

    case 'setup/move-player': {
      const fromIndex = action.index;
      const toIndex = fromIndex + action.direction;
      if (toIndex < 0 || toIndex >= state.setup.playerNames.length) {
        return state;
      }

      const playerNames = [...state.setup.playerNames];
      const current = playerNames[fromIndex];
      playerNames[fromIndex] = playerNames[toIndex];
      playerNames[toIndex] = current;

      return {
        ...state,
        setup: {
          ...state.setup,
          playerNames,
        },
      };
    }

    case 'setup/reorder-player': {
      const { fromIndex, toIndex } = action;
      if (
        fromIndex < 0 ||
        fromIndex >= state.setup.playerNames.length ||
        toIndex < 0 ||
        toIndex >= state.setup.playerNames.length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const playerNames = [...state.setup.playerNames];
      const [removed] = playerNames.splice(fromIndex, 1);
      playerNames.splice(toIndex, 0, removed);

      return {
        ...state,
        setup: {
          ...state.setup,
          playerNames,
        },
      };
    }

    case 'setup/set-role-count': {
      return {
        ...state,
        setup: {
          ...state.setup,
          roleCounts: {
            ...state.setup.roleCounts,
            [action.role]: Math.max(0, Math.min(state.setup.playerCount, action.value)),
          },
        },
      };
    }

    case 'game/start': {
      const players = buildPlayers(state.setup, action.rng);

      return {
        ...state,
        phase: 'briefing',
        setupStep: 'players',
        players,
        revealIndex: 0,
        briefingSlide: 0,
        rounds: [],
        night: null,
        gameResult: null,
      };
    }

    case 'game/start-demo': {
      return {
        ...state,
        phase: 'briefing',
        setupStep: 'players',
        setup: createDemoSetup(),
        players: createDemoPlayers(),
        revealIndex: 0,
        briefingSlide: 0,
        rounds: [],
        night: null,
        gameResult: null,
      };
    }

    case 'briefing/next': {
      if (state.briefingSlide < BRIEFING_SLIDE_COUNT - 1) {
        return {
          ...state,
          briefingSlide: state.briefingSlide + 1,
        };
      }

      return {
        ...state,
        phase: 'role-reveal',
        briefingSlide: 0,
      };
    }

    case 'briefing/skip': {
      return {
        ...state,
        phase: 'role-reveal',
        briefingSlide: 0,
      };
    }

    case 'reveal/advance': {
      if (state.phase !== 'role-reveal') {
        return state;
      }

      const nextRevealIndex = state.revealIndex + 1;
      if (nextRevealIndex >= state.players.length) {
        return {
          ...state,
          phase: 'night',
          night: createNightState(state.players, 1),
        };
      }

      return {
        ...state,
        revealIndex: nextRevealIndex,
      };
    }

    case 'night/start-turns': {
      if (state.phase !== 'night' || !state.night) {
        return state;
      }

      return {
        ...state,
        night: {
          ...state.night,
          step: 'handoff',
        },
      };
    }

    case 'night/submit-action': {
      if (state.phase !== 'night' || !state.night) {
        return state;
      }

      const actorId = state.night.actorOrder[state.night.currentTurnIndex];
      const actor = getPlayerById(state.players, actorId);
      const target = getPlayerById(state.players, action.targetId);

      if (!actor || !target) {
        return state;
      }

      const allowedTargets = getAllowedTargets(actor, state.players);
      if (!allowedTargets.some((candidate) => candidate.id === target.id)) {
        return state;
      }

      const nightAction = createNightAction(actor, target, state.night.round);
      const actions = [...state.night.actions, nightAction];
      const isLastTurn = state.night.currentTurnIndex === state.night.actorOrder.length - 1;

      if (isLastTurn) {
        const { updatedPlayers, roundRecord } = resolveNightRound(
          state.players,
          actions,
          state.night.round,
          action.rng,
        );
        const rounds = [...state.rounds, roundRecord];
        const winner = evaluateWinner(updatedPlayers);

        if (winner) {
          return {
            ...state,
            phase: 'game-over',
            players: updatedPlayers,
            rounds,
            night: null,
            gameResult: buildGameResult(winner, updatedPlayers, rounds),
          };
        }

        return {
          ...state,
          phase: 'round-resolution',
          players: updatedPlayers,
          rounds,
          night: null,
        };
      }

      return {
        ...state,
        night: {
          ...state.night,
          actions,
          currentTurnIndex: state.night.currentTurnIndex + 1,
          step: 'handoff',
        },
      };
    }

    case 'night/advance-handoff': {
      if (state.phase !== 'night' || !state.night) {
        return state;
      }

      return {
        ...state,
        night: {
          ...state.night,
          step: 'turn',
        },
      };
    }

    case 'resolution/continue': {
      if (state.phase !== 'round-resolution') {
        return state;
      }

      return {
        ...state,
        phase: 'day',
      };
    }

    case 'day/execute': {
      if (state.phase !== 'day') {
        return state;
      }

      const player = getPlayerById(state.players, action.playerId);
      if (!player || player.status !== 'alive') {
        return state;
      }

      const players = applyDayExecution(state.players, action.playerId);
      const rounds = attachDayExecution(state.rounds, action.playerId);
      const winner = evaluateWinner(players);

      if (winner) {
        return {
          ...state,
          phase: 'game-over',
          players,
          rounds,
          night: null,
          gameResult: buildGameResult(winner, players, rounds),
        };
      }

      const nextRound = (rounds[rounds.length - 1]?.round ?? 0) + 1;
      return {
        ...state,
        phase: 'night',
        players,
        rounds,
        night: {
          round: nextRound,
          step: 'intro',
          actorOrder: buildNightTurnOrder(players),
          currentTurnIndex: 0,
          actions: [],
        },
      };
    }

    case 'day/pass': {
      if (state.phase !== 'day') {
        return state;
      }

      const nextRound = (state.rounds[state.rounds.length - 1]?.round ?? 0) + 1;
      return {
        ...state,
        phase: 'night',
        night: createNightState(state.players, nextRound),
      };
    }

    case 'resolution/skip-to-night': {
      if (state.phase !== 'round-resolution') return state;
      const nextRound = (state.rounds[state.rounds.length - 1]?.round ?? 0) + 1;
      return {
        ...state,
        phase: 'night',
        night: createNightState(state.players, nextRound),
      };
    }

    case 'setup/clear-all-players': {
      return {
        ...state,
        setup: createInitialSetup(),
      };
    }

    case 'game/reset': {
      const base = createInitialAppState();
      if (action.savedPlayers?.length) {
        const playerNames = action.savedPlayers;
        const playerCount = playerNames.length;
        return {
          ...base,
          setup: {
            playerCount,
            playerNames,
            roleCounts: suggestRoleCounts(playerCount),
          },
        };
      }
      return base;
    }

    default:
      return state;
  }
}

export function getCurrentRevealPlayer(state: AppState) {
  return state.players[state.revealIndex] ?? null;
}

export function getCurrentNightActor(state: AppState) {
  if (state.phase !== 'night' || !state.night) {
    return null;
  }

  return getPlayerById(state.players, state.night.actorOrder[state.night.currentTurnIndex]);
}

export function hasMeaningfulSetup(setup: SetupState) {
  const suggestedCounts = suggestRoleCounts(setup.playerCount);
  const customizedRoles =
    suggestedCounts.mafia !== setup.roleCounts.mafia ||
    suggestedCounts.police !== setup.roleCounts.police ||
    suggestedCounts.doctor !== setup.roleCounts.doctor ||
    suggestedCounts.citizen !== setup.roleCounts.citizen;

  return (
    setup.playerCount !== createInitialSetup().playerCount ||
    customizedRoles ||
    setup.playerNames.some((name) => name.trim().length > 0)
  );
}

function canAdvanceSetupPlayers(setup: SetupState) {
  if (setup.playerCount < 4) {
    return false;
  }

  return setup.playerNames.slice(0, setup.playerCount).every((name) => name.trim().length > 0);
}
