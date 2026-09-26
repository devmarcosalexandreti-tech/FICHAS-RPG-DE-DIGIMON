import { test, expect } from "@playwright/test";

import {
  SHEET_CASES,
  downloadSheet,
  openSheet,
  saveAndReopen
} from "./helpers/sheets.js";

async function preventsUnload(page) {
  return page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });
}

for (const sheet of SHEET_CASES) {
  test.describe(sheet.name, () => {
    test("controla o aviso de alterações não salvas", async ({ page }) => {
      await openSheet(page, sheet.filename);
      expect(await preventsUnload(page)).toBe(false);

      await page.locator("#charName").fill(`Teste ${sheet.name}`);
      expect(await preventsUnload(page)).toBe(true);

      await downloadSheet(page);
      expect(await preventsUnload(page)).toBe(false);
    });

    test("rejeita nome em branco e cancela edição sem alterar o item", async ({ page }) => {
      await openSheet(page, sheet.filename);
      const modal = sheet.modal;

      await page.locator(modal.addButton).click();
      await page.locator(modal.nameInput).fill("   ");
      await page.locator(modal.confirmButton).click();
      await expect(page.locator(modal.error)).toHaveText("Informe o nome da habilidade.");
      await expect(page.locator(modal.item)).toHaveCount(0);

      await page.locator(modal.nameInput).fill("Habilidade original");
      await page.locator(modal.typeInput).fill("Tipo original");
      await page.locator(modal.descriptionInput).fill("Descrição original");
      await page.locator(modal.confirmButton).click();

      const item = page.locator(modal.item);
      await expect(item).toHaveCount(1);
      await item.locator('[data-action="edit-skill"]').click();
      await page.locator(modal.nameInput).fill("Nome que deve ser descartado");
      await page.locator(modal.typeInput).fill("Tipo que deve ser descartado");
      await page.locator(modal.cancelButton).click();

      await expect(page.locator(modal.overlay)).toBeHidden();
      await expect(item.locator(".skill-name")).toHaveText("Habilidade original");
      await expect(item.locator(".skill-type-label")).toHaveText("Tipo original");
    });

    test("gera nomes de arquivo seguros e usa fallback", async ({ page }) => {
      await openSheet(page, sheet.filename);

      const fallbackDownload = await downloadSheet(page);
      expect(fallbackDownload.suggestedFilename()).toMatch(
        new RegExp(`^DRPG_${sheet.fallbackFilename}_[0-9-]+\\.html$`)
      );

      await page.locator("#charName").fill('Herói <>:"/\\|?* final');
      const sanitizedDownload = await downloadSheet(page);
      const sanitizedFilename = sanitizedDownload.suggestedFilename();
      expect(sanitizedFilename).toMatch(/^DRPG_Herói_/);
      expect(sanitizedFilename).not.toMatch(/[<>:"/\\|?*\u0000-\u001F]/);
      expect(sanitizedFilename).toMatch(/_final_[0-9-]+\.html$/);
    });

    test("mantém alterações pendentes quando o download não pode ser iniciado", async ({ page }) => {
      await openSheet(page, sheet.filename);
      await page.locator("#charName").fill(`Falha ${sheet.name}`);
      await page.evaluate(() => {
        HTMLAnchorElement.prototype.click = () => {
          throw new Error("download indisponível");
        };
      });

      let errorMessage = "";
      page.once("dialog", async (dialog) => {
        errorMessage = dialog.message();
        await dialog.accept();
      });
      await page.locator("#btnSalvar").click();

      expect(errorMessage).toContain("Não foi possível iniciar o download");
      expect(await preventsUnload(page)).toBe(true);
    });
  });
}

test("Digimon: continua a numeração do inventário após salvar e reabrir", async ({ page }, testInfo) => {
  await openSheet(page, "DRPG_Ficha_Digimon_v1.5.html");
  await page.locator("#addInventoryRowBtn").click();
  await page.getByLabel("Item do inventário, linha 5").fill("Primeiro item dinâmico");

  await saveAndReopen(page, testInfo, "digimon-inventory-first-save.html");
  await page.locator("#addInventoryRowBtn").click();
  await page.getByLabel("Item do inventário, linha 6").fill("Segundo item dinâmico");

  await saveAndReopen(page, testInfo, "digimon-inventory-second-save.html");
  await expect(page.locator("#inventoryBody tr")).toHaveCount(6);
  await expect(page.getByLabel("Item do inventário, linha 5")).toHaveValue("Primeiro item dinâmico");
  await expect(page.getByLabel("Item do inventário, linha 6")).toHaveValue("Segundo item dinâmico");
});

test("Digimon: mantém condições únicas e fecha a lista ao clicar fora", async ({ page }) => {
  await openSheet(page, "DRPG_Ficha_Digimon_v1.5.html");
  const conditions = page.locator('#checkboxes input[type="checkbox"]');
  const values = await conditions.evaluateAll((inputs) => inputs.map((input) => input.value));
  expect(new Set(values).size).toBe(values.length);
  expect(values.filter((value) => value === "Ofuscado")).toHaveLength(1);

  await page.locator("#conditionSelectTrigger").click();
  await page.locator('#checkboxes input[value="Ofuscado"]').check();
  await page.locator("h1").click();

  await expect(page.locator("#checkboxes")).toBeHidden();
  await expect(page.locator("#conditionSelectTrigger")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#displayValue")).toContainText("Ofuscado");
});
