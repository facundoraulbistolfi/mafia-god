import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../docs/readme');
const baseURL = process.env.README_SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:5173/';
const README_DEMO_CAST = [
  'Anne Protheroe',
  'Miss Marple',
  'Dr. Haydock',
  'Hawes',
];

async function waitForStableFrame(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(250);
}

async function fillSetup(page, names) {
  for (let index = 1; index < names.length; index += 1) {
    await page.getByRole('button', { name: /agregar jugador/i }).click();
  }

  for (const [index, name] of names.entries()) {
    await page.getByLabel(`Nombre del jugador ${index + 1}`).fill(name);
  }
}

async function startCustomGame(page, names) {
  await page.addInitScript(() => {
    window.__MAFIA_GOD_TEST_RNG_VALUES__ = new Array(20).fill(0.999);
  });

  await page.goto(baseURL);
  await fillSetup(page, names);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();
  await page.getByRole('button', { name: 'SALTAR' }).click();
  await waitForStableFrame(page);
}

async function revealAllRoles(page, totalPlayers) {
  for (let index = 0; index < totalPlayers - 1; index += 1) {
    await page.getByRole('button', { name: 'Ver rol' }).click();
    await page.getByRole('button', { name: /Cerrar y pasar a/i }).click();
  }

  await page.getByRole('button', { name: 'Ver rol' }).click();
  await page.getByRole('button', { name: 'Cerrar y empezar la noche' }).click();
  await waitForStableFrame(page);
}

async function captureSetup(page) {
  await page.goto(baseURL);
  await fillSetup(page, README_DEMO_CAST);
  await waitForStableFrame(page);
  await page.screenshot({
    path: path.join(outputDir, 'setup-mobile.png'),
    fullPage: true,
  });
}

async function captureDemoModal(page) {
  await page.goto(baseURL);
  await page.getByRole('button', { name: '🎭 DEMO' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await waitForStableFrame(page);
  await dialog.screenshot({
    path: path.join(outputDir, 'demo-briefing-mobile.png'),
  });
}

async function captureNightAndGameOver(page) {
  await startCustomGame(page, README_DEMO_CAST);
  await revealAllRoles(page, 4);

  await page.getByRole('button', { name: 'COMENZAR RONDA 🔦' }).click();
  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await waitForStableFrame(page);
  await page.screenshot({
    path: path.join(outputDir, 'night-private-mobile.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'Hawes' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await page.getByRole('button', { name: 'Anne Protheroe' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();
  await page.waitForTimeout(3100);

  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await page.getByRole('button', { name: 'Dr. Haydock' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  await page.getByRole('button', { name: 'VER ACCIONES 🔦' }).click();
  await page.getByRole('button', { name: 'Hawes' }).click();
  await page.getByRole('button', { name: /^CONFIRMAR / }).click();

  await page.getByRole('button', { name: '☀️ IR AL DÍA' }).click();
  await page.getByRole('button', { name: '⚖️ EJECUTAR' }).click();
  await page.getByRole('button', { name: 'Miss Marple' }).click();
  await page.getByRole('button', { name: '⚖️ CONFIRMAR EJECUCIÓN' }).click();
  await waitForStableFrame(page);

  await page.screenshot({
    path: path.join(outputDir, 'game-over-mobile.png'),
    fullPage: true,
  });
}

async function withMobilePage(browser, callback) {
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  try {
    await callback(page);
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();

  try {
    await withMobilePage(browser, captureSetup);
    await withMobilePage(browser, captureDemoModal);
    await withMobilePage(browser, captureNightAndGameOver);
  } finally {
    await browser.close();
  }

  console.log(`README screenshots written to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
