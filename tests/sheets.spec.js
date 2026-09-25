import { test, expect } from "@playwright/test";
import {
  SCRIPT_INJECTION,
  expectAccessibleControls,
  openSheet,
  saveAndReopen
} from "./helpers/sheets.js";

async function expectDigimonInventoryRowContract(row) {
  await expect(row).toHaveClass(/\binventory-row\b/);
  await expect(row.locator("td").first()).toHaveClass(/\binventory-cell\b/);
  await expect(row.locator("input").first()).toHaveClass(/\binventory-input\b/);
  await expect(row.locator("input").last()).toHaveClass(/\binventory-input-wide\b/);
}

test("Digimon: adicionar, editar, salvar e reabrir", async ({ page }, testInfo) => {
  await openSheet(page, "DRPG_Ficha_Digimon_v1.5.html");
  await expectAccessibleControls(page);
  await expect(page.getByLabel("Espécie", { exact: true })).toHaveAttribute("id", "charName");
  await expect(page.getByRole("table", { name: "Inventário" })).toHaveClass("inventory-table");
  await expectDigimonInventoryRowContract(page.locator("#inventoryBody tr").first());
  await page.locator("#charName").fill("Teste / Digimon");
  await page.locator(".notes-area").fill(SCRIPT_INJECTION);

  const initialRows = await page.locator("#inventoryBody tr").count();
  await page.locator("#addInventoryRowBtn").click();
  await expect(page.locator("#inventoryBody tr")).toHaveCount(initialRows + 1);
  const addedInventoryRow = page.locator("#inventoryBody tr").last();
  await expectDigimonInventoryRowContract(addedInventoryRow);
  const inventoryInputs = addedInventoryRow.locator("input");
  await expect(page.getByLabel(`Item do inventário, linha ${initialRows + 1}`)).toBeVisible();
  await inventoryInputs.nth(0).fill("Poção");
  await inventoryInputs.nth(1).fill("Consumível");
  await inventoryInputs.nth(2).fill(SCRIPT_INJECTION);

  await page.locator("#addSkillBtn").click();
  await page.locator("#modalCancelBtn").click();
  await expect(page.locator("#modalOverlay")).toBeHidden();
  await expect(page.locator("#addSkillBtn")).toBeFocused();

  await page.locator("#addSkillBtn").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#modalOverlay")).toBeHidden();
  await expect(page.locator("#addSkillBtn")).toBeFocused();

  await page.locator("#addSkillBtn").click();
  await expect(page.locator("#modalOverlay")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("#modalOverlay")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#m_nome")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#saveModalBtn")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#m_nome")).toBeFocused();
  await expectAccessibleControls(page);
  await page.locator("#saveModalBtn").click();
  await expect(page.locator("#modalError")).toHaveText("Informe o nome da habilidade.");
  await expect(page.locator("#m_nome")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#skillsContainer .skill-item")).toHaveCount(0);
  await page.locator("#m_nome").fill(SCRIPT_INJECTION);
  await expect(page.locator("#modalError")).toBeHidden();
  await page.locator("#m_tipo").fill("Ataque");
  await page.locator("#m_alc").fill("Perto");
  await page.locator("#m_alv").fill("Um alvo");
  await page.locator("#m_dur").fill("Cena");
  await page.locator("#m_aca").fill("Livre");
  await page.locator("#m_uso").fill("1");
  await page.locator("#m_desc").fill(SCRIPT_INJECTION);
  await page.locator("#m_efe").fill("Efeito seguro");
  await page.locator("#saveModalBtn").click();

  const skill = page.locator("#skillsContainer .skill-item");
  await expect(skill).toHaveCount(1);
  await expect(skill.locator(".skill-name")).toHaveText(SCRIPT_INJECTION);
  await expect(skill.locator('[data-action="edit-skill"]')).toHaveAttribute("aria-label", /Editar habilidade/);
  await expect(page.locator("#modalOverlay")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#modalOverlay")).toHaveAttribute("inert", "");
  await expect(page.locator("#addSkillBtn")).toBeFocused();
  await skill.locator('[data-action="edit-skill"]').click();
  await page.locator("#m_tipo").fill("Ataque editado");
  await page.locator("#saveModalBtn").click();
  await expect(skill.locator(".skill-type-label")).toHaveText("Ataque editado");

  await page.locator("#addPowerBtn").click();
  await page.locator("#m_nome").fill("Escudo Prismático");
  await page.locator("#m_ben").fill("Proteção");
  await page.locator("#m_esp").fill("Uma vez por encontro");
  await page.locator("#saveModalBtn").click();
  await expect(page.locator("#powersContainer .skill-name")).toHaveText("Escudo Prismático");

  await page.locator("#conditionSelectTrigger").click();
  await page.locator('#checkboxes input[value="Ofuscado"]').check();
  await expect(page.locator("#displayValue")).toContainText("Ofuscado");

  const filename = await saveAndReopen(page, testInfo, "digimon-first-save.html");
  expect(filename).not.toContain("/");
  await expect(page.locator("#charName")).toHaveValue("Teste / Digimon");
  await expectAccessibleControls(page);
  await expect(page.locator(".notes-area")).toHaveValue(SCRIPT_INJECTION);
  await expect(page.locator("#inventoryBody tr").last().locator("input").nth(0)).toHaveValue("Poção");
  await expect(page.locator("#inventoryBody tr").last().locator("input").nth(2)).toHaveValue(SCRIPT_INJECTION);
  await expect(page.locator("#skillsContainer .skill-name")).toHaveText(SCRIPT_INJECTION);
  await expect(page.locator("#powersContainer .skill-name")).toHaveText("Escudo Prismático");
  await expect(page.locator('#checkboxes input[value="Ofuscado"]')).toBeChecked();
  await expect(page.locator("#conditionSelectTrigger")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#conditionSelectTrigger").click();
  await expect(page.locator("#conditionSelectTrigger")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#checkboxes")).toBeHidden();
  expect(await page.evaluate(() => window.__sheetXss)).toBeUndefined();
  await page.locator('#skillsContainer [data-action="edit-skill"]').click();
  await expect(page.locator("#m_nome")).toHaveValue(SCRIPT_INJECTION);
  await page.keyboard.press("Escape");

  await page.locator('#powersContainer [data-action="delete-skill"]').click();
  await expect(page.locator("#powersContainer .skill-item")).toHaveCount(0);
  await saveAndReopen(page, testInfo, "digimon-second-save.html");
  await expect(page.locator("#powersContainer .skill-item")).toHaveCount(0);
  await expect(page.locator("#skillsContainer .skill-name")).toHaveText(SCRIPT_INJECTION);
  await expect(page.locator('#checkboxes input[value="Ofuscado"]')).toBeChecked();
  await expect(page.locator(".notes-area")).toHaveValue(SCRIPT_INJECTION);
  expect(await page.evaluate(() => window.__sheetXss)).toBeUndefined();
});

test("Domador: adicionar, editar, salvar e reabrir", async ({ page }, testInfo) => {
  await openSheet(page, "DRPG_Ficha_Domador_v1.4.html");
  await expectAccessibleControls(page);
  await expect(page.getByLabel("Coragem", { exact: true })).toHaveAttribute("id", "pts-Coragem");
  await page.locator("#charName").fill("Teste / Domador");
  await page.locator(".notes-area").fill(SCRIPT_INJECTION);

  const courage = page.locator('[data-attribute="Coragem"]');
  const tierCases = [
    ["4", "TIER 0", "Covarde"],
    ["5", "TIER 1", "Arrojado"],
    ["14", "TIER 1", "Arrojado"],
    ["15", "TIER 2", "Determinado"],
    ["29", "TIER 2", "Determinado"],
    ["30", "TIER 3", "Bravo"],
    ["54", "TIER 3", "Bravo"],
    ["55", "TIER 4", "Corajoso"],
    ["79", "TIER 4", "Corajoso"],
    ["80", "TIER 5", "Destemido"]
  ];
  for (const [points, tier, title] of tierCases) {
    await courage.fill(points);
    await expect(page.locator("#t-Coragem")).toHaveText(tier);
    await expect(page.locator("#tit-Coragem")).toHaveText(title);
  }
  await courage.fill("30");

  const initialRows = await page.locator("#inventoryBody tr").count();
  await page.locator("#addInventoryRowBtn").click();
  await expect(page.locator("#inventoryBody tr")).toHaveCount(initialRows + 1);
  const inventoryInputs = page.locator("#inventoryBody tr").last().locator("input");
  await expect(page.getByLabel(`Item do inventário, linha ${initialRows + 1}`)).toBeVisible();
  await inventoryInputs.nth(0).fill("Notebook");
  await inventoryInputs.nth(1).fill("Equipamento");
  await inventoryInputs.nth(2).fill(SCRIPT_INJECTION);

  await page.locator("#addSkillBtn").click();
  await page.locator("#skillCancelBtn").click();
  await expect(page.locator("#skillModalOverlay")).toBeHidden();
  await expect(page.locator("#addSkillBtn")).toBeFocused();

  await page.locator("#addSkillBtn").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#skillModalOverlay")).toBeHidden();
  await expect(page.locator("#addSkillBtn")).toBeFocused();

  await page.locator("#addSkillBtn").click();
  await expect(page.locator("#skillModalOverlay")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("#skillModalOverlay")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#s_nome")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#skillSaveBtn")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#s_nome")).toBeFocused();
  await expectAccessibleControls(page);
  await page.locator("#skillSaveBtn").click();
  await expect(page.locator("#skillModalError")).toHaveText("Informe o nome da habilidade.");
  await expect(page.locator("#s_nome")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#skillsContainer .skill-item")).toHaveCount(0);
  await page.locator("#s_nome").fill(SCRIPT_INJECTION);
  await expect(page.locator("#skillModalError")).toBeHidden();
  await page.locator("#s_tipo").fill("Social");
  await page.locator("#s_desc").fill(SCRIPT_INJECTION);
  await page.locator("#skillSaveBtn").click();

  const skill = page.locator("#skillsContainer .skill-item");
  await expect(skill).toHaveCount(1);
  await expect(skill.locator('[data-action="edit-skill"]')).toHaveAttribute("aria-label", /Editar habilidade/);
  await expect(page.locator("#skillModalOverlay")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#skillModalOverlay")).toHaveAttribute("inert", "");
  await expect(page.locator("#addSkillBtn")).toBeFocused();
  await skill.locator('[data-action="edit-skill"]').click();
  await page.locator("#s_tipo").fill("Social editada");
  await page.locator("#skillSaveBtn").click();
  await expect(skill.locator(".skill-type-label")).toHaveText("Social editada");

  const filename = await saveAndReopen(page, testInfo, "domador-first-save.html");
  expect(filename).not.toContain("/");
  await expect(page.locator("#charName")).toHaveValue("Teste / Domador");
  await expectAccessibleControls(page);
  await expect(page.locator(".notes-area")).toHaveValue(SCRIPT_INJECTION);
  await expect(page.locator("#inventoryBody tr").last().locator("input").nth(0)).toHaveValue("Notebook");
  await expect(page.locator("#inventoryBody tr").last().locator("input").nth(2)).toHaveValue(SCRIPT_INJECTION);
  await expect(courage).toHaveValue("30");
  await expect(page.locator("#t-Coragem")).toHaveText("TIER 3");
  await expect(page.locator("#tit-Coragem")).toHaveText("Bravo");
  await expect(page.locator("#skillsContainer .skill-name")).toHaveText(SCRIPT_INJECTION);
  expect(await page.evaluate(() => window.__sheetXss)).toBeUndefined();
  await page.locator('#skillsContainer [data-action="edit-skill"]').click();
  await expect(page.locator("#s_nome")).toHaveValue(SCRIPT_INJECTION);
  await page.keyboard.press("Escape");

  await page.locator('#skillsContainer [data-action="delete-skill"]').click();
  await expect(page.locator("#skillsContainer .skill-item")).toHaveCount(0);
  await saveAndReopen(page, testInfo, "domador-second-save.html");
  await expect(page.locator("#skillsContainer .skill-item")).toHaveCount(0);
  await expect(page.locator(".notes-area")).toHaveValue(SCRIPT_INJECTION);
  await expect(page.locator("#t-Coragem")).toHaveText("TIER 3");
  expect(await page.evaluate(() => window.__sheetXss)).toBeUndefined();
});
