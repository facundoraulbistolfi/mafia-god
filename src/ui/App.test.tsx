import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

function setDeterministicRng(values: number[]) {
  window.__MAFIA_GOD_TEST_RNG_VALUES__ = values;
}

async function fillSetup(user: ReturnType<typeof userEvent.setup>, names: string[]) {
  for (let index = 1; index < names.length; index += 1) {
    await user.click(screen.getByRole('button', { name: /agregar jugador/i }));
  }

  for (let index = 0; index < names.length; index += 1) {
    const input = screen.getByLabelText(`Nombre del jugador ${index + 1}`);
    await user.clear(input);
    await user.type(input, names[index]);
  }
}

async function advanceToRoles(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /siguiente/i }));
}

async function startGameFromSetup(
  user: ReturnType<typeof userEvent.setup>,
  names: string[],
) {
  await fillSetup(user, names);
  await advanceToRoles(user);
  await user.click(screen.getByRole('button', { name: /iniciar partida/i }));
  await user.click(await screen.findByRole('button', { name: /saltar/i }));
}

async function revealAllRoles(user: ReturnType<typeof userEvent.setup>, totalPlayers: number) {
  for (let index = 0; index < totalPlayers; index += 1) {
    await user.click(await screen.findByRole('button', { name: /ver rol/i }));
    await user.click(await screen.findByRole('button', { name: /cerrar y/i }));
  }
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.__MAFIA_GOD_TEST_RNG_VALUES__;
  });

  afterEach(() => {
    cleanup();
  });

  it('shows inline validation when setup is invalid', async () => {
    render(<App />);

    const user = userEvent.setup();
    for (let index = 1; index < 4; index += 1) {
      await user.click(screen.getByRole('button', { name: /agregar jugador/i }));
    }

    for (const [index, name] of ['Ana', 'Bruno', 'Carla'].entries()) {
      const input = screen.getByLabelText(`Nombre del jugador ${index + 1}`);
      await user.clear(input);
      await user.type(input, name);
    }

    expect(screen.getAllByText(/el nombre no puede estar vacio/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });

  it('keeps the next button disabled until the minimum player count is reached', async () => {
    render(<App />);

    const user = userEvent.setup();

    const firstInput = screen.getByLabelText('Nombre del jugador 1');
    await user.clear(firstInput);
    await user.type(firstInput, 'Ana');

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();

    for (const [index, name] of ['Bruno', 'Carla', 'Diego'].entries()) {
      await user.click(screen.getByRole('button', { name: /agregar jugador/i }));
      const input = screen.getByLabelText(`Nombre del jugador ${index + 2}`);
      await user.clear(input);
      await user.type(input, name);
    }

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled();
  });

  it('starts the fixed demo cast directly in role reveal', async () => {
    render(<App />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /demo/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('St. Mary Mead');
    await user.click(screen.getByRole('button', { name: /iniciar demo/i }));
    await user.click(await screen.findByRole('button', { name: /saltar/i }));

    expect(await screen.findByRole('heading', { name: /turno de miss marple/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/fase actual/i)).toHaveTextContent('🎭 Revelacion');
    expect(screen.getByLabelText(/modo actual/i)).toHaveTextContent('📱 Pase');

    await user.click(screen.getByRole('button', { name: /ver rol/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Policia');
    expect(screen.getByText(/inspeccionas a otro jugador/i)).toBeInTheDocument();
    expect(screen.getByText('1/8')).toBeInTheDocument();
  });

  it('lets the user cancel the demo prompt and stay in setup', async () => {
    render(<App />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /demo/i }));

    expect(screen.getByRole('dialog')).toHaveTextContent('St. Mary Mead');
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sospechosos/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/fase actual/i)).toHaveTextContent('📋 Nuevo caso');
  });

  it('hides the previous secret role when the next player takes the phone', async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);
    await screen.findByRole('heading', { name: /turno de ana/i });
    await user.click(screen.getByRole('button', { name: /ver rol/i }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Mafia');
    expect(screen.getByRole('button', { name: /cerrar y pasar a bruno/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cerrar y pasar a bruno/i }));

    expect(screen.getByRole('heading', { name: /turno de bruno/i })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Mafia$/)).not.toBeInTheDocument();
  });

  it('uses a dedicated close label for the last reveal player', async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);

    for (let index = 0; index < 3; index += 1) {
      await user.click(await screen.findByRole('button', { name: /ver rol/i }));
      await user.click(await screen.findByRole('button', { name: /cerrar y pasar a/i }));
    }

    await user.click(await screen.findByRole('button', { name: /ver rol/i }));
    expect(screen.getByRole('button', { name: /cerrar y empezar la noche/i })).toBeInTheDocument();
  });

  it('shows the other mafias only to a mafia player when there are multiple', async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    render(<App />);

    const user = userEvent.setup();
    await fillSetup(user, ['Ana', 'Beto', 'Cora', 'Dante', 'Eva']);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(screen.getByRole('button', { name: /sumar mafia/i }));
    await user.click(screen.getByRole('button', { name: /restar ciudadano/i }));
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }));
    await user.click(await screen.findByRole('button', { name: /saltar/i }));
    await screen.findByRole('heading', { name: /turno de ana/i });
    await user.click(screen.getByRole('button', { name: /ver rol/i }));

    expect(screen.getByText(/otros mafias/i)).toBeInTheDocument();
    expect(screen.getByText('Beto')).toBeInTheDocument();
  });

  it('surfaces phase and mode badges for handoff, private and public scenes', async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);

    expect(await screen.findByLabelText(/fase actual/i)).toHaveTextContent('🎭 Revelacion');
    expect(screen.getByLabelText(/modo actual/i)).toHaveTextContent('📱 Pase');

    await user.click(screen.getByRole('button', { name: /ver rol/i }));
    expect(screen.getByLabelText(/modo privado/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cerrar y pasar a bruno/i }));

    await revealAllRoles(user, 3);
    await user.click(screen.getByRole('button', { name: /comenzar ronda/i }));

    expect(await screen.findByRole('heading', { name: /telefono para ana/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/fase actual/i)).toHaveTextContent('🌙 Noche');
    expect(screen.getByLabelText(/modo actual/i)).toHaveTextContent('📱 Pase');

    await user.click(screen.getByRole('button', { name: /ver acciones/i }));
    expect(await screen.findByText(/solo ana puede abrir los ojos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modo actual/i)).toHaveTextContent('🔒 Privado');
  });

  it('filters the night targets according to the active role and alive players', async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);
    await revealAllRoles(user, 4);

    await user.click(screen.getByRole('button', { name: /comenzar ronda/i }));
    expect(await screen.findByRole('heading', { name: /telefono para ana/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver acciones/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));

    expect(await screen.findByText(/solo ana puede abrir los ojos/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Ana/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Bruno/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Bruno/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));
    expect(screen.getByRole('heading', { name: /telefono para bruno/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));

    expect(screen.getByText(/solo bruno puede abrir los ojos/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Bruno/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Ana/ })).toBeInTheDocument();
  });

  it(
    'shows the private police feedback for three seconds',
    async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);
    await revealAllRoles(user, 4);
    await user.click(screen.getByRole('button', { name: /comenzar ronda/i }));
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));
    expect(screen.getByText(/solo ana puede abrir los ojos/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Bruno/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));
    await user.click(screen.getByRole('button', { name: /^Ana/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));

    expect(screen.getByText(/es mafia/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/es mafia/i)).not.toBeInTheDocument();
    }, { timeout: 4000 });
    expect(screen.getByRole('heading', { name: /telefono para carla/i })).toBeInTheDocument();
    },
    10000,
  );

  it('keeps the round resolution public and hides hidden mechanics', async () => {
    setDeterministicRng([
      0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999,
    ]);
    render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);
    await revealAllRoles(user, 4);
    await user.click(screen.getByRole('button', { name: /comenzar ronda/i }));
    await screen.findByRole('heading', { name: /telefono para ana/i });
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));
    await screen.findByText(/solo ana puede abrir los ojos/i);

    await user.click(screen.getByRole('button', { name: /^Diego/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));

    await user.click(screen.getByRole('button', { name: /^Ana/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));

    await user.click(screen.getByRole('button', { name: /^Carla/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));
    await user.click(screen.getByRole('button', { name: /ver acciones/i }));

    await user.click(screen.getByRole('button', { name: /^Diego/ }));
    await user.click(screen.getByRole('button', { name: /^confirmar /i }));

    expect(screen.getByRole('heading', { name: /resultado de la ronda/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/modo actual/i)).toHaveTextContent('🔓 Publico');
    expect(screen.queryByText(/doctor salvo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rezos ciudadanos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/objetivo mafioso final/i)).not.toBeInTheDocument();
  });

  it('shows a neutral resume prompt when a saved state exists', async () => {
    setDeterministicRng([0.999, 0.999, 0.999, 0.999, 0.999, 0.999]);
    const firstRender = render(<App />);

    const user = userEvent.setup();
    await startGameFromSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);

    expect(await screen.findByRole('heading', { name: /turno de ana/i })).toBeInTheDocument();

    firstRender.unmount();
    render(<App />);

    expect(screen.getByRole('button', { name: /continuar caso/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /caso en pausa/i })).toBeInTheDocument();
  });

  it('briefing shows slides, next advances, skip goes to reveal', async () => {
    render(<App />);
    const user = userEvent.setup();
    await fillSetup(user, ['Ana', 'Bruno', 'Carla', 'Diego']);
    await advanceToRoles(user);
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }));

    // Briefing slide 1
    expect(screen.getByRole('heading', { name: /instrucciones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saltar/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    // Still on briefing (slide 2)
    expect(screen.getByRole('button', { name: /saltar/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /saltar/i }));
    // Now on role-reveal
    expect(await screen.findByRole('button', { name: /ver rol/i })).toBeInTheDocument();
  });
});
