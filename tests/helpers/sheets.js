import { expect } from "@playwright/test";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const SCRIPT_INJECTION = "Teste </textarea><script>window.__sheetXss = true</script> & acao";

export const SHEET_CASES = [
  {
    name: "Digimon",
    filename: "DRPG_Ficha_Digimon_v1.5.html",
    fallbackFilename: "Ficha_Digimon",
    modal: {
      addButton: "#addSkillBtn",
      overlay: "#modalOverlay",
      nameInput: "#m_nome",
      typeInput: "#m_tipo",
      descriptionInput: "#m_desc",
      confirmButton: "#saveModalBtn",
      cancelButton: "#modalCancelBtn",
      error: "#modalError",
      item: "#skillsContainer .skill-item"
    }
  },
  {
    name: "Domador",
    filename: "DRPG_Ficha_Domador_v1.4.html",
    fallbackFilename: "Ficha_Domador",
    modal: {
      addButton: "#addSkillBtn",
      overlay: "#skillModalOverlay",
      nameInput: "#s_nome",
      typeInput: "#s_tipo",
      descriptionInput: "#s_desc",
      confirmButton: "#skillSaveBtn",
      cancelButton: "#skillCancelBtn",
      error: "#skillModalError",
      item: "#skillsContainer .skill-item"
    }
  }
];

export async function openSheet(page, filename) {
  await page.goto(pathToFileURL(path.join(projectRoot, filename)).href);
}

export async function downloadSheet(page) {
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#btnSalvar").click();
  return downloadPromise;
}

export async function saveAndReopen(page, testInfo, outputFilename) {
  const download = await downloadSheet(page);
  const savedPath = testInfo.outputPath(outputFilename);
  await copyFile(await download.path(), savedPath);
  await page.goto(pathToFileURL(savedPath).href);
  return download.suggestedFilename();
}

export async function expectAccessibleControls(page) {
  const unnamedControls = await page.locator("button, input, textarea, select").evaluateAll((controls) => controls
    .filter((control) => {
      const nativeLabel = Array.from(control.labels || []).some((label) => label.textContent.trim());
      const ariaLabel = control.getAttribute("aria-label")?.trim();
      const labelledBy = (control.getAttribute("aria-labelledby") || "")
        .split(/\s+/)
        .filter(Boolean)
        .some((id) => document.getElementById(id)?.textContent.trim());
      const textContent = control.matches("button") && control.textContent.trim();
      const inputValue = control.matches('input[type="button"], input[type="submit"], input[type="reset"]')
        && control.value.trim();
      return !nativeLabel && !ariaLabel && !labelledBy && !textContent && !inputValue;
    })
    .map((control) => control.outerHTML));

  expect(unnamedControls).toEqual([]);
}
