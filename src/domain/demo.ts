import type { Player, SetupState } from './types';

export const DEMO_CAST = [
  { name: 'Miss Marple', role: 'police' },
  { name: 'Dr. Haydock', role: 'doctor' },
  { name: 'Anne Protheroe', role: 'mafia' },
  { name: 'Lawrence Redding', role: 'mafia' },
  { name: 'Leonard Clement', role: 'citizen' },
  { name: 'Griselda Clement', role: 'citizen' },
  { name: 'Lettice Protheroe', role: 'citizen' },
  { name: 'Hawes', role: 'citizen' },
] as const;

export function createDemoSetup(): SetupState {
  return {
    playerCount: DEMO_CAST.length,
    playerNames: DEMO_CAST.map((entry) => entry.name),
    roleCounts: {
      mafia: 2,
      police: 1,
      doctor: 1,
      citizen: 4,
    },
  };
}

export function createDemoPlayers(): Player[] {
  return DEMO_CAST.map((entry, index) => ({
    id: `player-${index + 1}`,
    name: entry.name,
    role: entry.role,
    status: 'alive',
    order: index,
  }));
}
