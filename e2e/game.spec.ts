import { expect, test } from '@playwright/test';

test('starts the fixed demo preset from setup', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '🎭 DEMO' }).click();
  await expect(page.getByRole('dialog')).toContainText('St. Mary Mead');
  await page.getByRole('button', { name: 'Iniciar demo' }).click();
  await page.getByRole('button', { name: 'SALTAR' }).click();

  await expect(page.getByRole('heading', { name: 'Turno de Miss Marple' })).toBeVisible();
  await expect(page.getByLabel('Fase actual: 🎭 Revelacion')).toBeVisible();
  await expect(page.getByLabel('Modo actual: 📱 Pase')).toBeVisible();

  await page.getByRole('button', { name: 'Ver rol' }).click();
  await expect(page.getByRole('dialog')).toContainText('Policia');
  await expect(page.getByText('1/8')).toBeVisible();
});

test('plays a deterministic mobile round to game over', async ({ page }) => {
  await page.addInitScript(() => {
    window.__MAFIA_GOD_TEST_RNG_VALUES__ = new Array(20).fill(0.999);
  });

  await page.goto('/');

  const names = ['Ana', 'Bruno', 'Carla', 'Diego'];
  for (const [index, name] of names.entries()) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Agregar jugador' }).click();
    }
    await page.getByLabel(`Nombre del jugador ${index + 1}`).fill(name);
  }

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();
  await page.getByRole('button', { name: 'SALTAR' }).click();

  await expect(page.getByRole('heading', { name: 'Turno de Ana' })).toBeVisible();
  await expect(page.getByLabel('Fase actual: 🎭 Revelacion')).toBeVisible();
  await expect(page.getByLabel('Modo actual: 📱 Pase')).toBeVisible();
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Ver rol' }).click();
    await page.getByRole('button', { name: /Cerrar y pasar a/i }).click();
  }
  await page.getByRole('button', { name: 'Ver rol' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar y empezar la noche' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar y empezar la noche' }).click();

  await page.getByRole('button', { name: 'COMENZAR RONDA 🔦' }).click();
  await expect(page.getByRole('heading', { name: 'Telefono para Ana' })).toBeVisible();
  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await expect(page.getByLabel('Modo actual: 🔒 Privado')).toBeVisible();

  await page.getByRole('button', { name: 'Diego' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await page.getByRole('button', { name: 'Ana' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  await expect(page.getByText('ES MAFIA 🔪')).toBeVisible();
  await page.waitForTimeout(3100);

  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await page.getByRole('button', { name: 'Carla' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await page.getByRole('button', { name: 'Diego' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  // Resolution screen is now "SE HACE DE DÍA" / "Amanecer"
  await expect(page.getByRole('heading', { name: 'Amanecer' })).toBeVisible();
  await expect(page.getByLabel('Modo actual: 👁 Publico')).toBeVisible();
  // Death message now includes narrative flavor text
  await expect(page.getByText(/Diego/)).toBeVisible();

  // Two new action buttons on the resolution screen
  await page.getByRole('button', { name: '⚖️ EJECUTAR A ALGUIEN' }).click();
  // Day screen now starts directly with the execution picker
  await page.getByRole('button', { name: 'Bruno' }).click();
  await page.getByRole('button', { name: '⚖️ CONFIRMAR EJECUCIÓN' }).click();

  await expect(page.getByText('GANA LA MAFIA')).toBeVisible();
  await expect(page.getByText('Historial por ronda')).toBeVisible();
});
