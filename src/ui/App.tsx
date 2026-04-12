import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { getRuntimeRng } from '../app/runtime-rng';
import {
  clearSavedState,
  loadSavedState,
  saveState,
  shouldPersistState,
} from '../app/storage';
import {
  createInitialAppState,
  gameReducer,
  getCurrentNightActor,
  getCurrentRevealPlayer,
  type AppState,
  type GameAction,
} from '../app/state';
import {
  getAllowedTargets,
  getInspectionResult,
  getNightActionSummary,
  getPlayerById,
  getPlayerName,
  suggestRoleCounts,
  validateSetup,
} from '../domain/game';
import {
  BRIEFING_SLIDES,
  PRIVATE_RESULT_LABELS,
  ROLE_ACTION_LABELS,
  ROLE_DESCRIPTION,
  ROLE_EMOJI,
  ROLE_HELP_TEXT,
  ROLE_LABELS,
  WINNER_LABELS,
} from '../domain/labels';
import { DEMO_CAST } from '../domain/demo';
import type {
  NightState,
  Player,
  Role,
  RoleCounts,
  RoundRecord,
  SetupValidation,
} from '../domain/types';

const PHASE_LABELS: Record<AppState['phase'], string> = {
  setup: 'Preparacion',
  briefing: 'Briefing',
  'role-reveal': 'Revelacion',
  night: 'Noche',
  'round-resolution': 'Resolucion',
  day: 'Dia',
  'game-over': 'Final',
};

type RailPhase = AppState['phase'] | 'resume';
type ScreenMode = 'public' | 'handoff' | 'private';

const PHASE_META: Record<RailPhase, { label: string; badgeTone: string }> = {
  resume: { label: '📁 Caso en pausa', badgeTone: 'resume' },
  setup: { label: '📋 Nuevo caso', badgeTone: 'setup' },
  briefing: { label: '📖 Briefing', badgeTone: 'briefing' },
  'role-reveal': { label: '🎭 Revelacion', badgeTone: 'reveal' },
  night: { label: '🌙 Noche', badgeTone: 'night' },
  'round-resolution': { label: '⚡ Resolucion', badgeTone: 'resolution' },
  day: { label: '☀️ Dia', badgeTone: 'day' },
  'game-over': { label: '🏆 Final', badgeTone: 'final' },
};

const MODE_META: Record<ScreenMode, { label: string; badgeTone: string }> = {
  public: { label: '🔓 Publico', badgeTone: 'public' },
  handoff: { label: '📱 Pase', badgeTone: 'handoff' },
  private: { label: '🔒 Privado', badgeTone: 'private' },
};

const SCENE_COPY = {
  resume: {
    kicker: '📁 CASO EN PAUSA',
    title: 'Caso en pausa',
    subtitle: 'Volvés a una vista neutra antes de retomar el caso.',
  },
  setup: {
    players: {
      kicker: '📋 NUEVO CASO',
      title: 'Sospechosos',
      subtitle: 'Cargá nombres y orden de mesa para repartir roles.',
    },
    roles: {
      kicker: '📋 ROLES',
      title: 'Roles',
      subtitle: 'Revisá el reparto y larguen la partida.',
    },
    demo: {
      label: '🎭 DEMO',
      title: 'St. Mary Mead',
      subtitle: 'Carga una partida fija de 8 jugadores.',
      hint: 'Recorre una partida lista sin armar la mesa a mano.',
      summary: 'Ideal para mostrar el flujo o probar la experiencia.',
      warning: 'Reemplaza cualquier configuración actual.',
      cta: 'Iniciar demo',
      cancel: 'Cancelar',
    },
  },
  reveal: {
    kicker: '📱 PASE',
    subtitle: 'Teléfono en mano. Solo esa persona mira.',
    cardLabel: 'Sobre secreto',
    cardHint: 'Cuando el celular esté en sus manos, tocá la acción principal.',
  },
  revealDialog: {
    kicker: '🔒 CONFIDENCIAL',
    title: 'Rol asignado',
  },
  night: {
    intro: {
      kicker: '🌙 NOCHE',
      title: 'CAE LA NOCHE',
      subtitle: '🤫 Todos cierran los ojos.',
    },
    handoff: {
      kicker: '📱 PASE NOCTURNO',
      subtitle: 'Todos los demás siguen con los ojos cerrados.',
      cardLabel: 'Siguiente turno',
    },
    private: {
      kicker: '🔒 TURNO PRIVADO',
      titlePrefix: 'Turno de',
    },
  },
  resolution: {
    kicker: '⚡ RESOLUCIÓN',
    title: 'Resultado de la ronda',
    subtitle: 'Solo se muestra el desenlace público.',
  },
  day: {
    kicker: '☀️ DÍA',
    title: 'DELIBERACIÓN',
    subtitle: '🗣️ Hablen, acusen, defiendan...',
    executeTitle: 'Elegí a quién ejecutar',
  },
  gameOver: {
    kicker: '📁 CASO CERRADO',
    subtitle: 'Se libera toda la información del caso.',
  },
} as const;

interface SessionBootstrap {
  state: AppState;
  resumeRequired: boolean;
}

interface RailContext {
  phase: RailPhase;
  mode: ScreenMode;
  round: number | null;
}

export function App() {
  const [bootstrap] = useState<SessionBootstrap>(() => {
    const savedState = loadSavedState();
    return {
      state: savedState ?? createInitialAppState(),
      resumeRequired: Boolean(savedState),
    };
  });
  const [state, dispatch] = useReducer(gameReducer, bootstrap.state);
  const [resumeRequired, setResumeRequired] = useState(bootstrap.resumeRequired);
  const [inspectionOverlay, setInspectionOverlay] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const rngRef = useRef(getRuntimeRng());

  useEffect(() => {
    if (inspectionOverlay === null) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setInspectionOverlay(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [inspectionOverlay]);

  useEffect(() => {
    if (shouldPersistState(state)) {
      saveState(state);
    } else {
      clearSavedState();
    }
  }, [state]);

  const setupValidation = validateSetup(state.setup);
  const railContext = getRailContext(state, resumeRequired);

  const send = (action: GameAction) => {
    dispatch(action);
  };

  const handleContinueSaved = () => {
    setResumeRequired(false);
  };

  const handleStartFresh = () => {
    setResumeRequired(false);
    setInspectionOverlay(null);
    clearSavedState();
    send({ type: 'game/reset' });
  };

  const handleStartGame = () => {
    if (state.phase !== 'setup' || state.setupStep !== 'roles' || !setupValidation.isValid) {
      return;
    }

    send({ type: 'game/start', rng: rngRef.current });
  };

  const handleStartDemo = () => {
    setInspectionOverlay(null);
    send({ type: 'game/start-demo' });
  };

  const handleSubmitNightAction = (targetId: string) => {
    const actor = getCurrentNightActor(state);
    const target = getPlayerById(state.players, targetId);

    if (actor && target) {
      const inspectionResult = getInspectionResult(actor, target);
      if (inspectionResult) {
        setInspectionOverlay(PRIVATE_RESULT_LABELS[inspectionResult]);
      }
    }

    send({ type: 'night/submit-action', targetId, rng: rngRef.current });
  };

  const handleReorderPlayer = (fromIndex: number, toIndex: number) => {
    send({ type: 'setup/reorder-player', fromIndex, toIndex });
  };

  const phaseMeta = PHASE_META[railContext.phase];
  const modeMeta = MODE_META[railContext.mode];
  const showRulesButton = state.phase !== 'setup' && !resumeRequired;

  return (
    <div className="app-shell">
      <header className="top-rail">
        <div className="brand-signature">
          <strong className="brand-mark">🔍 MAFIA GOD</strong>
        </div>

        <div className="rail-badges">
          {showRulesButton ? (
            <button
              className="rules-button"
              type="button"
              aria-label="Ver reglas"
              onClick={() => setIsRulesModalOpen(true)}
            >
              📖
            </button>
          ) : null}
          <RailBadge
            ariaLabel={`Fase actual: ${phaseMeta.label}`}
            label={phaseMeta.label}
            tone={phaseMeta.badgeTone}
          />
          <RailBadge
            ariaLabel={`Modo actual: ${modeMeta.label}`}
            label={modeMeta.label}
            tone={modeMeta.badgeTone}
          />
          {railContext.round ? (
            <RailBadge
              ariaLabel={`Ronda actual: ${railContext.round}`}
              label={`Ronda ${railContext.round}`}
              tone="round"
            />
          ) : null}
        </div>
      </header>

      <main className="app-main">
        {resumeRequired ? (
          <ResumePrompt
            savedPhase={PHASE_LABELS[state.phase]}
            onContinue={handleContinueSaved}
            onReset={handleStartFresh}
          />
        ) : (
          <CurrentScreen
            state={state}
            setupValidation={setupValidation}
            onAddPlayer={() => send({ type: 'setup/add-player' })}
            onRemovePlayer={(index) => send({ type: 'setup/remove-player', index })}
            onAdvanceSetup={() => send({ type: 'setup/advance' })}
            onBackSetup={() => send({ type: 'setup/back' })}
            onSetPlayerName={(index, name) => send({ type: 'setup/set-player-name', index, name })}
            onMovePlayer={(index, direction) =>
              send({ type: 'setup/move-player', index, direction })
            }
            onReorderPlayer={handleReorderPlayer}
            onSetRoleCount={(role, value) => send({ type: 'setup/set-role-count', role, value })}
            onStartDemo={handleStartDemo}
            onStartGame={handleStartGame}
            onBriefingNext={() => send({ type: 'briefing/next' })}
            onBriefingSkip={() => send({ type: 'briefing/skip' })}
            onAdvanceReveal={() => send({ type: 'reveal/advance' })}
            onStartNightTurns={() => send({ type: 'night/start-turns' })}
            onSubmitNightAction={handleSubmitNightAction}
            onAdvanceHandoff={() => send({ type: 'night/advance-handoff' })}
            onContinueFromResolution={() => send({ type: 'resolution/continue' })}
            onExecuteDayPlayer={(playerId) => send({ type: 'day/execute', playerId })}
            onPassDay={() => send({ type: 'day/pass' })}
            onResetGame={handleStartFresh}
          />
        )}
      </main>

      {inspectionOverlay ? <InspectionOverlay message={inspectionOverlay} /> : null}
      {isRulesModalOpen ? <RulesModal onClose={() => setIsRulesModalOpen(false)} /> : null}
    </div>
  );
}

interface CurrentScreenProps {
  state: AppState;
  setupValidation: SetupValidation;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onAdvanceSetup: () => void;
  onBackSetup: () => void;
  onSetPlayerName: (index: number, name: string) => void;
  onMovePlayer: (index: number, direction: -1 | 1) => void;
  onReorderPlayer: (fromIndex: number, toIndex: number) => void;
  onSetRoleCount: (role: Role, value: number) => void;
  onStartDemo: () => void;
  onStartGame: () => void;
  onBriefingNext: () => void;
  onBriefingSkip: () => void;
  onAdvanceReveal: () => void;
  onStartNightTurns: () => void;
  onSubmitNightAction: (targetId: string) => void;
  onAdvanceHandoff: () => void;
  onContinueFromResolution: () => void;
  onExecuteDayPlayer: (playerId: string) => void;
  onPassDay: () => void;
  onResetGame: () => void;
}

function CurrentScreen({
  state,
  setupValidation,
  onAddPlayer,
  onRemovePlayer,
  onAdvanceSetup,
  onBackSetup,
  onSetPlayerName,
  onMovePlayer,
  onReorderPlayer,
  onSetRoleCount,
  onStartDemo,
  onStartGame,
  onBriefingNext,
  onBriefingSkip,
  onAdvanceReveal,
  onStartNightTurns,
  onSubmitNightAction,
  onAdvanceHandoff,
  onContinueFromResolution,
  onExecuteDayPlayer,
  onPassDay,
  onResetGame,
}: CurrentScreenProps) {
  switch (state.phase) {
    case 'setup':
      return (
        <SetupScreen
          setupStep={state.setupStep}
          setup={state.setup}
          validation={setupValidation}
          onAddPlayer={onAddPlayer}
          onRemovePlayer={onRemovePlayer}
          onAdvanceSetup={onAdvanceSetup}
          onBackSetup={onBackSetup}
          onSetPlayerName={onSetPlayerName}
          onMovePlayer={onMovePlayer}
          onReorderPlayer={onReorderPlayer}
          onSetRoleCount={onSetRoleCount}
          onStartDemo={onStartDemo}
          onStartGame={onStartGame}
        />
      );

    case 'briefing':
      return (
        <BriefingScreen
          slide={state.briefingSlide}
          onNext={onBriefingNext}
          onSkip={onBriefingSkip}
        />
      );

    case 'role-reveal': {
      const player = getCurrentRevealPlayer(state);
      if (!player) {
        return null;
      }

      return (
        <RoleRevealScreen
          key={player.id}
          player={player}
          players={state.players}
          currentIndex={state.revealIndex}
          totalPlayers={state.players.length}
          onAccept={onAdvanceReveal}
        />
      );
    }

    case 'night':
      return (
        <NightScreen
          key={`night-${state.night?.round ?? 0}-${state.night?.currentTurnIndex ?? 0}-${state.night?.step}`}
          night={state.night}
          players={state.players}
          onStartTurns={onStartNightTurns}
          onSubmitAction={onSubmitNightAction}
          onAdvanceHandoff={onAdvanceHandoff}
        />
      );

    case 'round-resolution': {
      const roundRecord = state.rounds[state.rounds.length - 1];
      if (!roundRecord) {
        return null;
      }

      return (
        <ResolutionScreen
          roundRecord={roundRecord}
          onContinue={onContinueFromResolution}
        />
      );
    }

    case 'day':
      return (
        <DayScreen
          round={state.rounds[state.rounds.length - 1]?.round ?? 0}
          players={state.players}
          onExecute={onExecuteDayPlayer}
          onPass={onPassDay}
        />
      );

    case 'game-over':
      if (!state.gameResult) {
        return null;
      }

      return <GameOverScreen result={state.gameResult} onReset={onResetGame} />;

    default:
      return null;
  }
}

interface RoleEmojiProps {
  role: Role;
  size?: 'sm' | 'lg';
}

function RoleEmoji({ role, size = 'sm' }: RoleEmojiProps) {
  const fontSize = size === 'lg' ? '48px' : '24px';
  return (
    <span
      role="img"
      aria-label={ROLE_LABELS[role]}
      style={{ fontSize, lineHeight: 1 }}
    >
      {ROLE_EMOJI[role]}
    </span>
  );
}

function RolePreviewGrid() {
  return (
    <div className="role-preview-grid">
      {(['mafia', 'police', 'doctor', 'citizen'] as Role[]).map((role) => (
        <div key={role} className="role-preview-item">
          <RoleEmoji role={role} size="sm" />
          <span>{ROLE_LABELS[role]}</span>
        </div>
      ))}
    </div>
  );
}

interface BriefingScreenProps {
  slide: number;
  onNext: () => void;
  onSkip: () => void;
}

function BriefingScreen({ slide, onNext, onSkip }: BriefingScreenProps) {
  const current = BRIEFING_SLIDES[slide];
  const isLastSlide = slide === BRIEFING_SLIDES.length - 1;

  return (
    <SceneFrame
      fit
      phase="briefing"
      mode="public"
      kicker="📖 BRIEFING"
      title="Instrucciones"
    >
      <div className="briefing-carousel">
        <div className="briefing-slide">
          <div className="briefing-slide__emoji">{current.emoji}</div>
          <h3 className="briefing-slide__title">{current.title}</h3>
          <p className="briefing-slide__body">{current.body}</p>
        </div>

        <div className="briefing-dots">
          {BRIEFING_SLIDES.map((_, index) => (
            <span
              key={index}
              className={`briefing-dot${index === slide ? ' is-active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="action-dock">
        <PrimaryButton onClick={onNext}>
          {isLastSlide ? 'COMENZAR →' : 'SIGUIENTE →'}
        </PrimaryButton>
        {!isLastSlide ? (
          <SecondaryButton onClick={onSkip}>SALTAR</SecondaryButton>
        ) : null}
      </div>
    </SceneFrame>
  );
}

interface RulesModalProps {
  onClose: () => void;
}

function RulesModal({ onClose }: RulesModalProps) {
  return (
    <Dialog onClose={onClose}>
      <div className="dialog-heading">
        <h3>📖 Reglas del juego</h3>
      </div>

      <div className="panel-card">
        <ul className="compact-list">
          <li>🔪 <strong>Mafia</strong>: Ataca a alguien cada noche. Ganan si igualan en número a los no-Mafia.</li>
          <li>🔍 <strong>Policía</strong>: Inspecciona a un jugador por noche y ve si es Mafia.</li>
          <li>💉 <strong>Doctor</strong>: Intenta salvar al objetivo elegido por la Mafia.</li>
          <li>🙏 <strong>Ciudadano</strong>: Reza para activar la chance extra de supervivencia.</li>
        </ul>
      </div>

      <div className="panel-card">
        <p className="field-hint">
          🌙 <strong>Noche</strong>: Cada rol actúa en secreto pasando el teléfono.<br/>
          ☀️ <strong>Día</strong>: Todos hablan y deciden a quién ejecutar.<br/>
          📱 <strong>Pantallas doradas</strong>: Solo para quien recibe el teléfono.<br/>
          🔒 <strong>Pantallas rojas</strong>: Solo para quien tiene el teléfono en ese momento.
        </p>
      </div>

      <SecondaryButton onClick={onClose}>Cerrar</SecondaryButton>
    </Dialog>
  );
}

interface ResumePromptProps {
  savedPhase: string;
  onContinue: () => void;
  onReset: () => void;
}

function ResumePrompt({ savedPhase, onContinue, onReset }: ResumePromptProps) {
  return (
    <SceneFrame
      fit
      phase="resume"
      mode="public"
      kicker={SCENE_COPY.resume.kicker}
      title={SCENE_COPY.resume.title}
      subtitle={SCENE_COPY.resume.subtitle}
      meta={<MetaPill label={savedPhase} tone="ghost" />}
      footer={
        <div className="action-dock">
          <PrimaryButton onClick={onContinue}>CONTINUAR CASO</PrimaryButton>
          <SecondaryButton onClick={onReset}>NUEVO CASO</SecondaryButton>
        </div>
      }
    >
      <section className="panel-card panel-card--public">
        <span className="section-label">Ultima fase guardada</span>
        <strong className="panel-value">{savedPhase}</strong>
        <p className="field-hint">La partida vuelve a una vista segura para evitar filtraciones.</p>
      </section>
    </SceneFrame>
  );
}

interface SetupScreenProps {
  setupStep: AppState['setupStep'];
  setup: AppState['setup'];
  validation: SetupValidation;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onAdvanceSetup: () => void;
  onBackSetup: () => void;
  onSetPlayerName: (index: number, name: string) => void;
  onMovePlayer: (index: number, direction: -1 | 1) => void;
  onReorderPlayer: (fromIndex: number, toIndex: number) => void;
  onSetRoleCount: (role: Role, value: number) => void;
  onStartDemo: () => void;
  onStartGame: () => void;
}

function SetupScreen({
  setupStep,
  setup,
  validation,
  onAddPlayer,
  onRemovePlayer,
  onAdvanceSetup,
  onBackSetup,
  onSetPlayerName,
  onMovePlayer,
  onReorderPlayer,
  onSetRoleCount,
  onStartDemo,
  onStartGame,
}: SetupScreenProps) {
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const prevPlayerCountRef = useRef(setup.playerCount);
  const suggestedCounts = suggestRoleCounts(setup.playerCount);
  const totalRoles =
    setup.roleCounts.mafia +
    setup.roleCounts.police +
    setup.roleCounts.doctor +
    setup.roleCounts.citizen;
  const canAdvanceSetup =
    !validation.playerCountError && Object.keys(validation.playerNameErrors).length === 0;
  const playerSetupStatus = getPlayerSetupStatus(setup, validation);
  const roleSetupStatus = getRoleSetupStatus(setup, validation, totalRoles, suggestedCounts);
  useEffect(() => {
    if (setup.playerCount > prevPlayerCountRef.current) {
      lastInputRef.current?.focus();
      if (typeof lastInputRef.current?.scrollIntoView === 'function') {
        lastInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    prevPlayerCountRef.current = setup.playerCount;
  }, [setup.playerCount]);

  const openDemoDialog = () => setIsDemoDialogOpen(true);
  const closeDemoDialog = () => setIsDemoDialogOpen(false);
  const confirmDemoDialog = () => {
    setIsDemoDialogOpen(false);
    onStartDemo();
  };

  if (setupStep === 'players') {
    return (
      <>
        <SceneFrame
          phase="setup"
          mode="public"
          kicker={SCENE_COPY.setup.players.kicker}
          title={SCENE_COPY.setup.players.title}
          subtitle={SCENE_COPY.setup.players.subtitle}
          meta={
            <MetaPill
              label={`${setup.playerCount} ${setup.playerCount === 1 ? 'jugador' : 'jugadores'}`}
              tone={setup.playerCount >= 4 ? 'safe' : 'ghost'}
            />
          }
          footer={
            <div className="action-dock action-dock--solo">
              <PrimaryButton onClick={onAdvanceSetup} disabled={!canAdvanceSetup}>
                Siguiente
              </PrimaryButton>
            </div>
          }
        >
          <SetupSceneStatus status={playerSetupStatus} />

          <section className="setup-sheet">
            <div className="section-head">
              <div>
                <span className="section-label">Orden de mesa</span>
                <h3>Jugadores</h3>
              </div>
              <MetaPill
                label={`${setup.playerCount}/20`}
                tone={setup.playerCount >= 4 ? 'safe' : 'ghost'}
              />
            </div>

            {validation.playerCountError ? (
              <p className="field-error">{validation.playerCountError}</p>
            ) : (
              <p className="field-hint">
                Este orden define revelacion, pases de telefono y turnos nocturnos.
              </p>
            )}

            <div className="player-list">
              {setup.playerNames.map((playerName, index) => (
                <div
                  className="player-row"
                  key={`setup-player-${index + 1}`}
                  draggable={true}
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== index) {
                      onReorderPlayer(dragIndex, index);
                      setDragIndex(null);
                    }
                  }}
                >
                  <span className="player-drag-handle" aria-hidden="true">≡</span>
                  <div className="player-order">
                    <span>{index + 1}</span>
                  </div>
                  <div className="player-field">
                    <label className="sr-only" htmlFor={`player-name-${index}`}>
                      Nombre del jugador {index + 1}
                    </label>
                    <input
                      ref={index === setup.playerNames.length - 1 ? lastInputRef : undefined}
                      id={`player-name-${index}`}
                      className="text-input"
                      value={playerName}
                      placeholder={`Jugador ${index + 1}`}
                      onChange={(event) => onSetPlayerName(index, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' || !playerName.trim()) return;
                        event.preventDefault();
                        const nextInput = document.getElementById(`player-name-${index + 1}`) as HTMLInputElement | null;
                        if (nextInput) {
                          nextInput.focus();
                        } else if (setup.playerCount < 20) {
                          onAddPlayer();
                        } else if (canAdvanceSetup) {
                          onAdvanceSetup();
                        }
                      }}
                    />
                    {validation.playerNameErrors[index] ? (
                      <p className="field-error">{validation.playerNameErrors[index]}</p>
                    ) : null}
                  </div>
                  <div className="reorder-actions">
                    <IconButton
                      label={`Subir a ${playerName || `Jugador ${index + 1}`}`}
                      disabled={index === 0}
                      onClick={() => onMovePlayer(index, -1)}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      label={`Bajar a ${playerName || `Jugador ${index + 1}`}`}
                      disabled={index === setup.playerNames.length - 1}
                      onClick={() => onMovePlayer(index, 1)}
                    >
                      ↓
                    </IconButton>
                    <IconButton
                      label={`Quitar a ${playerName || `Jugador ${index + 1}`}`}
                      disabled={setup.playerNames.length === 1}
                      onClick={() => onRemovePlayer(index)}
                    >
                      ×
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            <div className="setup-sheet-footer">
              <SecondaryButton onClick={onAddPlayer} disabled={setup.playerCount >= 20}>
                Agregar jugador
              </SecondaryButton>

              <div className="setup-utility-row">
                <SecondaryButton onClick={openDemoDialog}>
                  {SCENE_COPY.setup.demo.label}
                </SecondaryButton>
                <p className="field-hint">{SCENE_COPY.setup.demo.hint}</p>
              </div>
            </div>
          </section>
        </SceneFrame>

        {isDemoDialogOpen ? (
          <DemoSetupDialog onClose={closeDemoDialog} onConfirm={confirmDemoDialog} />
        ) : null}
      </>
    );
  }

  return (
    <>
      <SceneFrame
        phase="setup"
        mode="public"
        kicker={SCENE_COPY.setup.roles.kicker}
        title={SCENE_COPY.setup.roles.title}
        subtitle={SCENE_COPY.setup.roles.subtitle}
        meta={
          <MetaPill
            label={`${totalRoles}/${setup.playerCount}`}
            tone={totalRoles === setup.playerCount ? 'safe' : 'alert'}
          />
        }
        footer={
          <div className="action-dock">
            <PrimaryButton onClick={onStartGame} disabled={!validation.isValid}>
              Iniciar partida
            </PrimaryButton>
            <SecondaryButton onClick={onBackSetup}>
              Volver a jugadores
            </SecondaryButton>
          </div>
        }
      >
        <SetupSceneStatus status={roleSetupStatus} />

        <div className="panel-grid panel-grid--setup">
          <section className="panel-card panel-card--muted">
            <div className="section-head">
              <div>
                <span className="section-label">Grupo cargado</span>
                <h3>Orden confirmado</h3>
              </div>
              <MetaPill
                label={`${setup.playerCount} ${setup.playerCount === 1 ? 'jugador' : 'jugadores'}`}
                tone="ghost"
              />
            </div>

            <p className="field-hint">El reparto sugerido parte de este orden circular.</p>

            <ol className="compact-list compact-list--ordered">
              {setup.playerNames.map((playerName, index) => (
                <li key={`setup-summary-${index + 1}`}>
                  {playerName || `Jugador ${index + 1}`}
                </li>
              ))}
            </ol>
          </section>

          <section className="panel-card panel-card--public">
            <div className="section-head">
              <div>
                <span className="section-label">Reparto</span>
                <h3>Roles en juego</h3>
              </div>
              <MetaPill
                label={`Sugerido: ${formatRoleCounts(suggestedCounts)}`}
                tone="ghost"
                compact
              />
            </div>

            <div className="role-stepper-list">
              {(Object.keys(setup.roleCounts) as Role[]).map((role) => (
                <RoleStepper
                  key={role}
                  role={role}
                  count={setup.roleCounts[role]}
                  onChange={(value) => onSetRoleCount(role, value)}
                />
              ))}
            </div>

            {validation.roleErrors.length ? (
              <ul className="error-list">
                {validation.roleErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}

            <RolePreviewGrid />
          </section>
        </div>

        <div className="setup-utility-row setup-utility-row--inline">
          <SecondaryButton onClick={openDemoDialog}>
            {SCENE_COPY.setup.demo.label}
          </SecondaryButton>
          <p className="field-hint">{SCENE_COPY.setup.demo.warning}</p>
        </div>
      </SceneFrame>

      {isDemoDialogOpen ? (
        <DemoSetupDialog onClose={closeDemoDialog} onConfirm={confirmDemoDialog} />
      ) : null}
    </>
  );
}

interface SetupSceneStatusProps {
  status: {
    detail: string;
    label: string;
    title: string;
    tone: 'alert' | 'safe' | 'warning';
  };
}

function SetupSceneStatus({ status }: SetupSceneStatusProps) {
  return (
    <section className={`setup-status setup-status--${status.tone}`}>
      <span className="section-label">{status.label}</span>
      <strong>{status.title}</strong>
      <p className="field-hint">{status.detail}</p>
    </section>
  );
}

interface DemoSetupDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

function DemoSetupDialog({ onClose, onConfirm }: DemoSetupDialogProps) {
  return (
    <Dialog onClose={onClose}>
      <div className="dialog-badge-row">
        <MetaPill label={SCENE_COPY.setup.demo.label} tone="ghost" />
        <MetaPill label={`${DEMO_CAST.length} jugadores`} tone="alert" />
      </div>

      <div className="dialog-heading">
        <p className="section-label">Elenco preset</p>
        <h3>{SCENE_COPY.setup.demo.title}</h3>
        <p className="support-copy">{SCENE_COPY.setup.demo.summary}</p>
      </div>

      <section className="panel-card panel-card--public">
        <p className="field-hint">{SCENE_COPY.setup.demo.warning}</p>
        <ul className="compact-list">
          {DEMO_CAST.map((entry) => (
            <li key={entry.name}>
              {entry.name} - {ROLE_LABELS[entry.role]}
            </li>
          ))}
        </ul>
      </section>

      <div className="action-dock">
        <PrimaryButton onClick={onConfirm}>{SCENE_COPY.setup.demo.cta}</PrimaryButton>
        <SecondaryButton onClick={onClose}>{SCENE_COPY.setup.demo.cancel}</SecondaryButton>
      </div>
    </Dialog>
  );
}

interface RoleRevealScreenProps {
  player: Player;
  players: Player[];
  currentIndex: number;
  totalPlayers: number;
  onAccept: () => void;
}

function RoleRevealScreen({
  player,
  players,
  currentIndex,
  totalPlayers,
  onAccept,
}: RoleRevealScreenProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [player.id]);

  const otherMafias = players.filter(
    (candidate) => candidate.role === 'mafia' && candidate.id !== player.id,
  );
  const nextPlayer = players[currentIndex + 1] ?? null;
  const closeLabel = nextPlayer
    ? `Cerrar y pasar a ${nextPlayer.name}`
    : 'Cerrar y empezar la noche';

  return (
    <SceneFrame
      fit
      phase="role-reveal"
      mode="handoff"
      kicker={SCENE_COPY.reveal.kicker}
      title={`Turno de ${player.name}`}
      subtitle={SCENE_COPY.reveal.subtitle}
      meta={<MetaPill label={`${currentIndex + 1}/${totalPlayers}`} tone="ghost" />}
      footer={
        <div className="action-dock">
          <PrimaryButton onClick={() => setIsOpen(true)}>Ver rol</PrimaryButton>
        </div>
      }
    >
      <section className="spotlight-card spotlight-card--handoff">
        <span className="section-label">{SCENE_COPY.reveal.cardLabel}</span>
        <strong className="spotlight-name">{player.name}</strong>
        <p className="field-hint">{SCENE_COPY.reveal.cardHint}</p>
      </section>

      {isOpen ? (
        <Dialog onClose={() => setIsOpen(false)}>
          <div className="dialog-badge-row">
            <RailBadge ariaLabel="Modo privado" label="Privado" tone="private" />
            <MetaPill label={SCENE_COPY.revealDialog.title} tone="alert" />
          </div>

          <div className="role-reveal-identity">
            <RoleEmoji role={player.role} size="lg" />
            <div>
              <p className="section-label">{SCENE_COPY.revealDialog.kicker}</p>
              <h3>{ROLE_LABELS[player.role]}</h3>
              <p className="support-copy">{ROLE_DESCRIPTION[player.role]}</p>
            </div>
          </div>

          {player.role === 'mafia' && otherMafias.length ? (
            <div className="panel-card panel-card--private">
              <span className="section-label">Red conocida</span>
              <h4>Otros mafias</h4>
              <ul className="compact-list">
                {otherMafias.map((mafia) => (
                  <li key={mafia.id}>{mafia.name}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <PrimaryButton
            onClick={() => {
              setIsOpen(false);
              onAccept();
            }}
          >
            {closeLabel}
          </PrimaryButton>
        </Dialog>
      ) : null}
    </SceneFrame>
  );
}

interface NightScreenProps {
  night: NightState | null;
  players: Player[];
  onStartTurns: () => void;
  onSubmitAction: (targetId: string) => void;
  onAdvanceHandoff: () => void;
}

function NightScreen({
  night,
  players,
  onStartTurns,
  onSubmitAction,
  onAdvanceHandoff,
}: NightScreenProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTargetId(null);
  }, [night?.currentTurnIndex, night?.step, night?.round]);

  if (!night) {
    return null;
  }

  const actor = getPlayerById(players, night.actorOrder[night.currentTurnIndex]);
  const allowedTargets = actor ? getAllowedTargets(actor, players) : [];

  if (night.step === 'intro') {
    return (
      <SceneFrame
        fit
        phase="night"
        mode="public"
        kicker={SCENE_COPY.night.intro.kicker}
        title={SCENE_COPY.night.intro.title}
        subtitle={SCENE_COPY.night.intro.subtitle}
        footer={
          <div className="action-dock">
            <PrimaryButton onClick={onStartTurns}>COMENZAR RONDA 🔦</PrimaryButton>
          </div>
        }
      >
        <section className="spotlight-card spotlight-card--public">
          <span className="section-label">Regla de mesa</span>
          <strong className="spotlight-name">Solo mira quien tenga el telefono</strong>
        </section>
      </SceneFrame>
    );
  }

  if (night.step === 'handoff') {
    const nextActor = getPlayerById(players, night.actorOrder[night.currentTurnIndex]);
    if (!nextActor) {
      return null;
    }

    return (
      <SceneFrame
        fit
        phase="night"
        mode="handoff"
        kicker={SCENE_COPY.night.handoff.kicker}
        title={`Telefono para ${nextActor.name}`}
        subtitle={SCENE_COPY.night.handoff.subtitle}
        footer={
          <div className="action-dock">
            <PrimaryButton onClick={onAdvanceHandoff}>VER ACCIONES 🔦</PrimaryButton>
          </div>
        }
      >
        <section className="spotlight-card spotlight-card--handoff">
          <span className="section-label">{SCENE_COPY.night.handoff.cardLabel}</span>
          <strong className="spotlight-name">{nextActor.name}</strong>
          <p className="field-hint">Solo esa persona deberia tocar la accion principal.</p>
        </section>
      </SceneFrame>
    );
  }

  if (!actor) {
    return null;
  }

  return (
    <SceneFrame
      fit
      phase="night"
      mode="private"
      kicker={SCENE_COPY.night.private.kicker}
      title={`${SCENE_COPY.night.private.titlePrefix} ${actor.name}`}
      subtitle={`Solo ${actor.name} puede abrir los ojos.`}
      meta={<MetaPill label={ROLE_LABELS[actor.role]} tone="alert" />}
      footer={
        <div className="action-dock">
          <PrimaryButton
            disabled={!selectedTargetId}
            onClick={() => selectedTargetId && onSubmitAction(selectedTargetId)}
          >
            CONFIRMAR {ROLE_EMOJI[actor.role]}
          </PrimaryButton>
        </div>
      }
    >
      <section className="panel-card panel-card--private">
        <div className="role-action-heading">
          <RoleEmoji role={actor.role} size="sm" />
          <div>
            <h3>{ROLE_ACTION_LABELS[actor.role]}</h3>
            <p className="field-hint">{ROLE_HELP_TEXT[actor.role]}</p>
          </div>
        </div>
      </section>

      <div className="target-list" role="list">
        {allowedTargets.map((target) => (
          <button
            key={target.id}
            className={target.id === selectedTargetId ? 'target-card is-selected' : 'target-card'}
            type="button"
            onClick={() => setSelectedTargetId(target.id)}
          >
            <span>{target.name}</span>
            {target.id === actor.id ? <small>Vos</small> : null}
          </button>
        ))}
      </div>
    </SceneFrame>
  );
}

interface ResolutionScreenProps {
  roundRecord: RoundRecord;
  onContinue: () => void;
}

function ResolutionScreen({ roundRecord, onContinue }: ResolutionScreenProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setRevealed(true), 800);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <SceneFrame
      fit
      phase="round-resolution"
      mode="public"
      kicker={SCENE_COPY.resolution.kicker}
      title={SCENE_COPY.resolution.title}
      subtitle={SCENE_COPY.resolution.subtitle}
      footer={
        <div className="action-dock">
          <PrimaryButton onClick={onContinue} disabled={!revealed}>☀️ IR AL DÍA</PrimaryButton>
        </div>
      }
    >
      <section className="result-banner" aria-live="polite">
        <span className="section-label">Mensaje permitido</span>
        <strong className={revealed ? 'result-text--revealed' : 'result-text--hidden'}>
          {roundRecord.publicMessage}
        </strong>
      </section>
    </SceneFrame>
  );
}

interface DayScreenProps {
  round: number;
  players: Player[];
  onExecute: (playerId: string) => void;
  onPass: () => void;
}

function DayScreen({ round, players, onExecute, onPass }: DayScreenProps) {
  const [isChoosingExecution, setIsChoosingExecution] = useState(false);
  const [pendingExecutionId, setPendingExecutionId] = useState<string | null>(null);
  const livingPlayers = players.filter((player) => player.status === 'alive');

  useEffect(() => {
    setIsChoosingExecution(false);
    setPendingExecutionId(null);
  }, [round]);

  return (
    <>
    <SceneFrame
      fit
      phase="day"
      mode="public"
      kicker={SCENE_COPY.day.kicker}
      title={SCENE_COPY.day.title}
      subtitle={SCENE_COPY.day.subtitle}
      meta={<MetaPill label={`Ronda ${round}`} tone="ghost" />}
    >
      {!isChoosingExecution ? (
        <div className="action-dock action-dock--stacked">
          <PrimaryButton onClick={() => setIsChoosingExecution(true)}>
            ⚖️ EJECUTAR
          </PrimaryButton>
          <SecondaryButton onClick={onPass}>🌙 NOCHE</SecondaryButton>
        </div>
      ) : (
        <div className="execution-picker">
          <section className="panel-card panel-card--public">
            <span className="section-label">Decision colectiva</span>
            <h3>{SCENE_COPY.day.executeTitle}</h3>
            <p className="field-hint">Solo se listan jugadores vivos.</p>
          </section>

          <div className="target-list" role="list">
            {livingPlayers.map((player) => (
              <button
                key={player.id}
                className="target-card"
                type="button"
                onClick={() => setPendingExecutionId(player.id)}
              >
                <span>{player.name}</span>
                <small>Vivo</small>
              </button>
            ))}
          </div>

          <SecondaryButton onClick={() => setIsChoosingExecution(false)}>Cancelar</SecondaryButton>
        </div>
      )}
    </SceneFrame>

    {pendingExecutionId ? (
      <ExecutionConfirmDialog
        playerName={getPlayerName(players, pendingExecutionId)}
        onConfirm={() => {
          onExecute(pendingExecutionId);
          setPendingExecutionId(null);
        }}
        onCancel={() => setPendingExecutionId(null)}
      />
    ) : null}
  </>
  );
}

interface ExecutionConfirmDialogProps {
  playerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ExecutionConfirmDialog({ playerName, onConfirm, onCancel }: ExecutionConfirmDialogProps) {
  return (
    <Dialog onClose={onCancel}>
      <div className="dialog-badge-row">
        <MetaPill label="Dia" tone="ghost" />
        <MetaPill label="Confirmacion" tone="alert" />
      </div>

      <div className="dialog-heading">
        <p className="section-label">Decision colectiva</p>
        <h3>Ejecutar a {playerName}</h3>
        <p className="support-copy">Esta accion no se puede deshacer. El grupo confirma la decision.</p>
      </div>

      <div className="action-dock">
        <PrimaryButton onClick={onConfirm}>⚖️ CONFIRMAR EJECUCIÓN</PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancelar</SecondaryButton>
      </div>
    </Dialog>
  );
}

interface GameOverScreenProps {
  result: NonNullable<AppState['gameResult']>;
  onReset: () => void;
}

function GameOverScreen({ result, onReset }: GameOverScreenProps) {
  return (
    <SceneFrame
      phase="game-over"
      mode="public"
      kicker={SCENE_COPY.gameOver.kicker}
      title={WINNER_LABELS[result.winner]}
      subtitle={SCENE_COPY.gameOver.subtitle}
      footer={
        <div className="action-dock">
          <PrimaryButton onClick={onReset}>🔄 NUEVA PARTIDA</PrimaryButton>
        </div>
      }
    >
      <div className="panel-grid">
        <section className="panel-card">
          <div className="section-head">
            <div>
              <span className="section-label">Cierre</span>
              <h3>Estado final</h3>
            </div>
            <MetaPill label={`${result.finalPlayers.length} jugadores`} tone="ghost" />
          </div>

          <div className="final-player-list">
            {result.finalPlayers
              .slice()
              .sort((left, right) => left.order - right.order)
              .map((player) => (
                <article className="final-player-card" key={player.id}>
                  <div className="final-player-identity">
                    <RoleEmoji role={player.role} size="sm" />
                    <div>
                      <strong>{player.name}</strong>
                      <p>{ROLE_LABELS[player.role]}</p>
                    </div>
                  </div>
                  <StatusPill status={player.status} />
                </article>
              ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="section-head">
            <div>
              <span className="section-label">Archivo completo</span>
              <h3>Historial por ronda</h3>
            </div>
          </div>

          <div className="timeline">
            {result.rounds.map((roundRecord) => (
              <article className="timeline-entry" key={`round-${roundRecord.round}`}>
                <div className="timeline-heading">
                  <strong>Ronda {roundRecord.round}</strong>
                  <span>{roundRecord.publicMessage}</span>
                </div>

                <div className="timeline-block">
                  <h4>Acciones nocturnas</h4>
                  <ul className="compact-list">
                    {roundRecord.nightActions.map((action) => (
                      <li key={`${roundRecord.round}-${action.actorId}-${action.targetId}-${action.role}`}>
                        {getNightActionSummary(action, result.finalPlayers)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="timeline-block">
                  <h4>Resolucion oculta</h4>
                  <ul className="compact-list">
                    <li>
                      Objetivo mafioso final:{' '}
                      <strong>{getPlayerName(result.finalPlayers, roundRecord.mafiaTargetId)}</strong>
                    </li>
                    <li>Doctor salvo: {roundRecord.doctorSaved ? 'Si' : 'No'}</li>
                    <li>
                      Rezos ciudadanos: {roundRecord.citizenPrayerCount}/
                      {roundRecord.citizenPrayerThreshold || 0}
                    </li>
                    <li>
                      50/50 ciudadano:{' '}
                      {!roundRecord.citizenPrayerTriggered
                        ? 'No se activo'
                        : roundRecord.citizenPrayerSaved
                          ? 'Sobrevive'
                          : 'Muere'}
                    </li>
                    <li>
                      Muerte nocturna:{' '}
                      <strong>{getPlayerName(result.finalPlayers, roundRecord.nightDeathPlayerId)}</strong>
                    </li>
                    <li>
                      Ejecucion diurna:{' '}
                      <strong>{getPlayerName(result.finalPlayers, roundRecord.dayExecutionPlayerId)}</strong>
                    </li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SceneFrame>
  );
}

interface SceneFrameProps {
  children: ReactNode;
  className?: string;
  fit?: boolean;
  footer?: ReactNode;
  kicker: string;
  meta?: ReactNode;
  mode: ScreenMode;
  phase: RailPhase;
  subtitle?: string;
  title: string;
}

function SceneFrame({
  children,
  className = '',
  fit = false,
  footer,
  kicker,
  meta,
  mode,
  phase,
  subtitle,
  title,
}: SceneFrameProps) {
  return (
    <section
      className={`scene ${fit ? 'scene--fit' : ''} ${className}`.trim()}
      data-phase={phase}
      data-screen-mode={mode}
    >
      <div className="scene-head">
        <div className="scene-head-row">
          <p className="scene-kicker">{kicker}</p>
          {meta ? <div className="scene-meta">{meta}</div> : null}
        </div>
        <div className="scene-heading">
          <h2>{title}</h2>
          {subtitle ? <p className="support-copy">{subtitle}</p> : null}
        </div>
      </div>

      <div className="scene-body">{children}</div>
      {footer ? <div className="scene-footer">{footer}</div> : null}
    </section>
  );
}

interface RoleStepperProps {
  role: Role;
  count: number;
  onChange: (value: number) => void;
}

function RoleStepper({ role, count, onChange }: RoleStepperProps) {
  return (
    <div className="role-stepper">
      <div className="role-inline">
        <RoleEmoji role={role} size="sm" />
        <strong>{ROLE_LABELS[role]}</strong>
      </div>

      <div className="stepper-controls">
        <IconButton label={`Restar ${ROLE_LABELS[role]}`} onClick={() => onChange(count - 1)}>
          -
        </IconButton>
        <span className="stepper-value">{count}</span>
        <IconButton label={`Sumar ${ROLE_LABELS[role]}`} onClick={() => onChange(count + 1)}>
          +
        </IconButton>
      </div>
    </div>
  );
}

interface RailBadgeProps {
  ariaLabel: string;
  label: string;
  tone: string;
}

function RailBadge({ ariaLabel, label, tone }: RailBadgeProps) {
  return (
    <span aria-label={ariaLabel} className={`rail-badge rail-badge--${tone}`}>
      <span aria-hidden="true" className="rail-badge-mark" />
      <span>{label}</span>
    </span>
  );
}

interface MetaPillProps {
  compact?: boolean;
  label: string;
  tone: 'alert' | 'ghost' | 'safe';
}

function MetaPill({ compact = false, label, tone }: MetaPillProps) {
  return (
    <span className={`meta-pill meta-pill--${tone} ${compact ? 'meta-pill--compact' : ''}`.trim()}>
      {label}
    </span>
  );
}

interface StatusPillProps {
  status: Player['status'];
}

function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={status === 'alive' ? 'status-pill is-alive' : 'status-pill is-dead'}>
      {status === 'alive' ? 'Vivo' : 'Muerto'}
    </span>
  );
}

interface DialogProps {
  children: ReactNode;
  onClose: () => void;
}

function Dialog({ children, onClose }: DialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog-panel" role="dialog" aria-modal="true">
        {children}
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>
    </div>
  );
}

interface InspectionOverlayProps {
  message: string;
}

function InspectionOverlay({ message }: InspectionOverlayProps) {
  return (
    <div className="inspection-overlay" role="status" aria-live="assertive">
      <div className="inspection-card">
        <span className="section-label">Privado</span>
        <strong>{message}</strong>
      </div>
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function PrimaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`button button-primary ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`button button-secondary ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

function IconButton({ children, label, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`icon-button ${className}`.trim()}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function getPlayerSetupStatus(setup: AppState['setup'], validation: SetupValidation) {
  const missingPlayers = Math.max(0, 4 - setup.playerCount);
  const emptyNameCount = Object.keys(validation.playerNameErrors).length;

  if (missingPlayers > 0) {
    return {
      label: 'Minimo para jugar',
      title: `Faltan ${missingPlayers} ${missingPlayers === 1 ? 'jugador' : 'jugadores'}`,
      detail: 'Completa la mesa y despues pasamos al reparto de roles.',
      tone: 'warning' as const,
    };
  }

  if (emptyNameCount > 0) {
    return {
      label: 'Nombres pendientes',
      title: `${emptyNameCount} ${emptyNameCount === 1 ? 'nombre sigue vacio' : 'nombres siguen vacios'}`,
      detail: 'La app necesita todos los nombres cargados antes de seguir.',
      tone: 'alert' as const,
    };
  }

  return {
    label: 'Mesa lista',
    title: 'Ya podes pasar al reparto',
    detail: 'El orden actual gobierna revelacion, pases de telefono y turnos nocturnos.',
    tone: 'safe' as const,
  };
}

function getRoleSetupStatus(
  setup: AppState['setup'],
  validation: SetupValidation,
  totalRoles: number,
  suggestedCounts: RoleCounts,
) {
  if (validation.roleErrors.length > 0) {
    return {
      label: 'Reparto invalido',
      title:
        totalRoles !== setup.playerCount
          ? `La suma da ${totalRoles} y la mesa pide ${setup.playerCount}`
          : 'Hace falta ajustar los roles',
      detail: validation.roleErrors[0],
      tone: 'alert' as const,
    };
  }

  return {
    label: 'Reparto listo',
    title: 'Todo cierra con la mesa cargada',
    detail: `Sugerido para ${setup.playerCount}: ${formatRoleCounts(suggestedCounts)}.`,
    tone: 'safe' as const,
  };
}

function getCurrentRound(state: AppState) {
  if (state.phase === 'night') {
    return state.night?.round ?? null;
  }

  if (state.phase === 'setup' || state.phase === 'briefing' || state.phase === 'role-reveal') {
    return null;
  }

  return state.rounds[state.rounds.length - 1]?.round ?? null;
}

function getRailContext(state: AppState, resumeRequired: boolean): RailContext {
  if (resumeRequired) {
    return {
      phase: 'resume',
      mode: 'public',
      round: getCurrentRound(state),
    };
  }

  if (state.phase === 'briefing') {
    return {
      phase: 'briefing',
      mode: 'public',
      round: null,
    };
  }

  if (state.phase === 'night') {
    const mode =
      !state.night || state.night.step === 'intro'
        ? 'public'
        : state.night.step === 'handoff'
          ? 'handoff'
          : 'private';

    return {
      phase: 'night',
      mode,
      round: state.night?.round ?? null,
    };
  }

  if (state.phase === 'role-reveal') {
    return {
      phase: 'role-reveal',
      mode: 'handoff',
      round: null,
    };
  }

  return {
    phase: state.phase,
    mode: 'public',
    round: getCurrentRound(state),
  };
}

function formatRoleCounts(roleCounts: RoleCounts) {
  return `${roleCounts.mafia} Mafia, ${roleCounts.police} Policia, ${roleCounts.doctor} Doctor y ${roleCounts.citizen} Ciudadano`;
}
