import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const sheets = [
  ["Digimon", "DRPG_Ficha_Digimon_v1.5.html", "digimon.png"],
  ["Domador", "DRPG_Ficha_Domador_v1.4.html", "domador.png"]
];

for (const [name, filename, snapshot] of sheets) {
  test(`${name}: aparência permanece estável`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(pathToFileURL(path.join(projectRoot, filename)).href);
    await expect(page).toHaveScreenshot(snapshot, {
      animations: "disabled",
      caret: "hide",
      fullPage: true
    });
  });
}
