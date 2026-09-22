import { test, expect } from "@playwright/test";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const injection = "Teste </textarea><script>window.__sheetXss = true</script> & acao";

async function openSheet(page, filename) {
  await page.goto(pathToFileURL(path.join(projectRoot, filename)).href);
}

async function saveAndReopen(page, testInfo) {
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#btnSalvar").click();
  const download = await downloadPromise;
  const savedPath = testInfo.outputPath("saved-sheet.html");
  await copyFile(await download.path(), savedPath);
  await page.goto(pathToFileURL(savedPath).href);
  return download.suggestedFilename();
}

test("Digimon: adicionar, editar, salvar e reabrir", async ({ page }, testInfo) => {
  await openSheet(page, "DRPG_Ficha_Digimon_v1.5.html");
  await page.locator("#charName").fill("Teste / Digimon");

  const initialRows = await page.locator("#inventoryBody tr").count();
  await page.locator("#addInventoryRowBtn").click();
  await expect(page.locator("#inventoryBody tr")).toHaveCount(initialRows + 1);

  await page.locator("#addSkillBtn").click();
  await expect(page.locator("#modalOverlay")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("#m_nome")).toBeFocused();
  await page.locator("#saveModalBtn").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#m_nome")).toBeFocused();
  await page.locator("#saveModalBtn").click();
  await expect(page.locator("#modalError")).toHaveText("Informe o nome da habilidade.");
  await expect(page.locator("#m_nome")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#skillsContainer .skill-item")).toHaveCount(0);
  await page.locator("#m_nome").fill(injection);
  await expect(page.locator("#modalError")).toBeHidden();
  await page.locator("#m_tipo").fill("Ataque");
  await page.locator("#m_alc").fill("Perto");
  await page.locator("#m_alv").fill("Um alvo");
  await page.locator("#m_dur").fill("Cena");
  await page.locator("#m_aca").fill("Livre");
  await page.locator("#m_uso").fill("1");
  await page.locator("#m_desc").fill(injection);
  await page.locator("#m_efe").fill("Efeito seguro");
  await page.locator("#saveModalBtn").click();

  const skill = page.locator("#skillsContainer .skill-item");
  await expect(skill).toHaveCount(1);
  await expect(skill.locator(".skill-name")).toHaveText(injection);
  await expect(skill.locator('[data-action="edit-skill"]')).toHaveAttribute("aria-label", /Editar habilidade/);
  await expect(page.locator("#modalOverlay")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#addSkillBtn")).toBeFocused();
  await skill.locator('[data-action="edit-skill"]').click();
  await page.locator("#m_tipo").fill("Ataque editado");
  await page.locator("#saveModalBtn").click();
  await expect(skill.locator(".skill-type-label")).toHaveText("Ataque editado");

  const filename = await saveAndReopen(page, testInfo);
  expect(filename).not.toContain("/");
  await expect(page.locator("#charName")).toHaveValue("Teste / Digimon");
  await expect(page.locator("#skillsContainer .skill-name")).toHaveText(injection);
  expect(await page.evaluate(() => window.__sheetXss)).toBeUndefined();
  await page.locator('#skillsContainer [data-action="edit-skill"]').click();
  await expect(page.locator("#m_nome")).toHaveValue(injection);
});

test("Domador: adicionar, editar, salvar e reabrir", async ({ page }, testInfo) => {
  await openSheet(page, "DRPG_Ficha_Domador_v1.4.html");
  await page.locator("#charName").fill("Teste / Domador");

  const courage = page.locator('[data-attribute="Coragem"]');
  await courage.fill("30");
  await expect(page.locator("#t-Coragem")).toHaveText("TIER 3");
  await expect(page.locator("#tit-Coragem")).toHaveText("Bravo");

  const initialRows = await page.locator("#inventoryBody tr").count();
  await page.locator("#addInventoryRowBtn").click();
  await expect(page.locator("#inventoryBody tr")).toHaveCount(initialRows + 1);

  await page.locator("#addSkillBtn").click();
  await expect(page.locator("#skillModalOverlay")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("#s_nome")).toBeFocused();
  await page.locator("#skillSaveBtn").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#s_nome")).toBeFocused();
  await page.locator("#skillSaveBtn").click();
  await expect(page.locator("#skillModalError")).toHaveText("Informe o nome da habilidade.");
  await expect(page.locator("#s_nome")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#skillsContainer .skill-item")).toHaveCount(0);
  await page.locator("#s_nome").fill(injection);
  await expect(page.locator("#skillModalError")).toBeHidden();
  await page.locator("#s_tipo").fill("Social");
  await page.locator("#s_desc").fill(injection);
  await page.locator("#skillSaveBtn").click();

  const skill = page.locator("#skillsContainer .skill-item");
  await expect(skill).toHaveCount(1);
  await expect(skill.locator('[data-action="edit-skill"]')).toHaveAttribute("aria-label", /Editar habilidade/);
  await expect(page.locator("#skillModalOverlay")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#addSkillBtn")).toBeFocused();
  await skill.locator('[data-action="edit-skill"]').click();
  await page.locator("#s_tipo").fill("Social editada");
  await page.locator("#skillSaveBtn").click();
  await expect(skill.locator(".skill-type-label")).toHaveText("Social editada");

  const filename = await saveAndReopen(page, testInfo);
  expect(filename).not.toContain("/");
  await expect(page.locator("#charName")).toHaveValue("Teste / Domador");
  await expect(page.locator("#skillsContainer .skill-name")).toHaveText(injection);
  expect(await page.evaluate(() => window.__sheetXss)).toBeUndefined();
  await page.locator('#skillsContainer [data-action="edit-skill"]').click();
  await expect(page.locator("#s_nome")).toHaveValue(injection);
});
