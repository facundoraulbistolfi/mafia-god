export type Role = 'mafia' | 'police' | 'doctor' | 'citizen';

export type GamePhase =
  | 'setup'
  | 'briefing'
  | 'role-reveal'
  | 'night'
  | 'round-resolution'
  | 'day'
  | 'game-over';

export type PlayerStatus = 'alive' | 'dead';

export type Winner = 'citizens' | 'mafia';

export type PrivateInspectionResult = 'is-mafia' | 'not-mafia';

export interface RoleCounts {
  mafia: number;
  police: number;
  doctor: number;
  citizen: number;
}

export interface SetupState {
  playerCount: number;
  playerNames: string[];
  roleCounts: RoleCounts;
}

export interface SetupValidation {
  isValid: boolean;
  playerCountError?: string;
  playerNameErrors: Record<number, string>;
  roleErrors: string[];
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  status: PlayerStatus;
  order: number;
}

export interface NightAction {
  actorId: string;
  role: Role;
  targetId: string;
  round: number;
  privateResult?: PrivateInspectionResult;
}

export interface RoundRecord {
  round: number;
  nightActions: NightAction[];
  mafiaTargetId: string | null;
  doctorSaved: boolean;
  citizenPrayerThreshold: number;
  citizenPrayerCount: number;
  citizenPrayerTriggered: boolean;
  citizenPrayerSaved: boolean | null;
  nightDeathPlayerId: string | null;
  publicMessage: string;
  dayExecutionPlayerId: string | null;
  deathFlavorIndex: number;
  gatheringFlavorIndex: number;
}

export interface GameResult {
  winner: Winner;
  finalPlayers: Player[];
  rounds: RoundRecord[];
}

export type NightStep = 'intro' | 'turn' | 'handoff';

export interface NightState {
  round: number;
  step: NightStep;
  actorOrder: string[];
  currentTurnIndex: number;
  actions: NightAction[];
}
