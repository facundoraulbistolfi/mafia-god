import {
  applyDayExecution,
  attachDayExecution,
  buildGameResult,
  buildNightTurnOrder,
  createNightAction,
  evaluateWinner,
  getAllowedTargets,
  resolveNightRound,
  suggestRoleCounts,
  validateSetup,
} from './game';
import { SequenceRng } from './rng';
import type { NightAction, Player, RoundRecord, SetupState } from './types';

function createPlayers(): Player[] {
  return [
    { id: 'player-1', name: 'Ana', role: 'mafia', status: 'alive', order: 0 },
    { id: 'player-2', name: 'Beto', role: 'police', status: 'alive', order: 1 },
    { id: 'player-3', name: 'Cora', role: 'doctor', status: 'alive', order: 2 },
    { id: 'player-4', name: 'Dante', role: 'citizen', status: 'alive', order: 3 },
    { id: 'player-5', name: 'Eva', role: 'citizen', status: 'alive', order: 4 },
  ];
}

function createRoundRecord(): RoundRecord {
  return {
    round: 1,
    nightActions: [],
    mafiaTargetId: 'player-4',
    doctorSaved: false,
    citizenPrayerThreshold: 1,
    citizenPrayerCount: 0,
    citizenPrayerTriggered: false,
    citizenPrayerSaved: null,
    nightDeathPlayerId: 'player-4',
    publicMessage: 'Murio Dante',
    dayExecutionPlayerId: null,
  };
}

describe('game domain', () => {
  it('suggests the expected base role split', () => {
    expect(suggestRoleCounts(4)).toEqual({
      mafia: 1,
      police: 1,
      doctor: 1,
      citizen: 1,
    });

    expect(suggestRoleCounts(8)).toEqual({
      mafia: 2,
      police: 1,
      doctor: 1,
      citizen: 4,
    });
  });

  it('validates setup constraints from the spec', () => {
    const setup: SetupState = {
      playerCount: 4,
      playerNames: ['Ana', '', 'Cora', 'Dante'],
      roleCounts: {
        mafia: 0,
        police: 1,
        doctor: 1,
        citizen: 2,
      },
    };

    const validation = validateSetup(setup);

    expect(validation.isValid).toBe(false);
    expect(validation.playerNameErrors[1]).toMatch(/no puede estar vacio/i);
    expect(validation.roleErrors).toContain('Debe haber al menos 1 Mafia.');
  });

  it('builds the night order without reordering and skipping dead players', () => {
    const players = createPlayers();
    players[1] = { ...players[1], status: 'dead' };
    players[3] = { ...players[3], status: 'dead' };

    expect(buildNightTurnOrder(players)).toEqual(['player-1', 'player-3', 'player-5']);
  });

  it('filters targets according to each role rules', () => {
    const players = createPlayers();
    const mafia = players[0];
    const police = players[1];
    const doctor = players[2];

    expect(getAllowedTargets(mafia, players).map((player) => player.id)).toEqual([
      'player-2',
      'player-3',
      'player-4',
      'player-5',
    ]);
    expect(getAllowedTargets(police, players).map((player) => player.id)).not.toContain('player-2');
    expect(getAllowedTargets(doctor, players).map((player) => player.id)).toContain('player-3');
  });

  it('stores the private police result on the night action', () => {
    const players = createPlayers();
    const police = players[1];
    const mafia = players[0];

    expect(createNightAction(police, mafia, 1).privateResult).toBe('is-mafia');
  });

  it('resolves the mafia target with weighted randomness', () => {
    const players = createPlayers();
    const actions: NightAction[] = [
      { actorId: 'player-1', role: 'mafia', targetId: 'player-4', round: 1 },
      { actorId: 'player-1b', role: 'mafia', targetId: 'player-4', round: 1 },
      { actorId: 'player-6', role: 'mafia', targetId: 'player-5', round: 1 },
    ];
    const rng = new SequenceRng([0.2]);

    const result = resolveNightRound(players, actions, 1, rng);

    expect(result.roundRecord.mafiaTargetId).toBe('player-4');
    expect(result.roundRecord.publicMessage).toBe('Murio Dante');
  });

  it('gives the doctor full priority over other night effects', () => {
    const players = createPlayers();
    const actions: NightAction[] = [
      { actorId: 'player-1', role: 'mafia', targetId: 'player-4', round: 1 },
      { actorId: 'player-3', role: 'doctor', targetId: 'player-4', round: 1 },
      { actorId: 'player-4', role: 'citizen', targetId: 'player-4', round: 1 },
      { actorId: 'player-5', role: 'citizen', targetId: 'player-4', round: 1 },
    ];

    const result = resolveNightRound(players, actions, 1, new SequenceRng([0.99]));

    expect(result.roundRecord.doctorSaved).toBe(true);
    expect(result.roundRecord.nightDeathPlayerId).toBeNull();
    expect(result.roundRecord.publicMessage).toBe('Nadie murio');
  });

  it('activates the citizen prayer threshold and can save the target on 50/50', () => {
    const players = createPlayers();
    const actions: NightAction[] = [
      { actorId: 'player-1', role: 'mafia', targetId: 'player-4', round: 1 },
      { actorId: 'player-4', role: 'citizen', targetId: 'player-4', round: 1 },
      { actorId: 'player-5', role: 'citizen', targetId: 'player-4', round: 1 },
    ];

    const result = resolveNightRound(players, actions, 1, new SequenceRng([0.2, 0.1]));

    expect(result.roundRecord.citizenPrayerTriggered).toBe(true);
    expect(result.roundRecord.citizenPrayerSaved).toBe(true);
    expect(result.roundRecord.nightDeathPlayerId).toBeNull();
  });

  it('can also fail the citizen prayer 50/50 and kill the target', () => {
    const players = createPlayers();
    const actions: NightAction[] = [
      { actorId: 'player-1', role: 'mafia', targetId: 'player-4', round: 1 },
      { actorId: 'player-4', role: 'citizen', targetId: 'player-4', round: 1 },
      { actorId: 'player-5', role: 'citizen', targetId: 'player-4', round: 1 },
    ];

    const result = resolveNightRound(players, actions, 1, new SequenceRng([0.2, 0.9]));

    expect(result.roundRecord.citizenPrayerSaved).toBe(false);
    expect(result.roundRecord.nightDeathPlayerId).toBe('player-4');
  });

  it('evaluates win conditions after deaths and executions', () => {
    const players = createPlayers();
    const citizensWin = applyDayExecution(players, 'player-1');
    const mafiaParity = applyDayExecution(players, 'player-2');
    mafiaParity[3] = { ...mafiaParity[3], status: 'dead' };
    mafiaParity[4] = { ...mafiaParity[4], status: 'dead' };

    expect(evaluateWinner(citizensWin)).toBe('citizens');
    expect(evaluateWinner(mafiaParity)).toBe('mafia');
  });

  it('keeps the final history with the recorded day execution', () => {
    const players = createPlayers();
    const rounds = attachDayExecution([createRoundRecord()], 'player-2');
    const result = buildGameResult('mafia', players, rounds);

    expect(result.rounds[0].dayExecutionPlayerId).toBe('player-2');
    expect(result.winner).toBe('mafia');
  });
});
