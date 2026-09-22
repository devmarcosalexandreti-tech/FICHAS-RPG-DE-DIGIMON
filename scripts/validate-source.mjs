import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), "..");

const files = [
  "DRPG_Ficha_Digimon_v1.5.html",
  "DRPG_Ficha_Domador_v1.4.html"
];

export const forbiddenPatterns = [
  [/\son[a-z]+\s*=/i, "handler inline"],
  [/\.on[a-z]+\s*=/i, "handler atribuído por propriedade"],
  [/\.innerHTML\s*=/, "atribuição a innerHTML"],
  [/\.outerHTML\s*=/, "atribuição a outerHTML"],
  [/\.insertAdjacentHTML\s*\(/, "chamada a insertAdjacentHTML"],
  [/document\.write(?:ln)?\s*\(/, "chamada a document.write"],
  [/\beval\s*\(/, "chamada a eval"],
  [/\bjavascript\s*:/i, "URL javascript"],
  [/querySelector(?:All)?\([^)]*style\*=/, "seletor dependente de estilo"],
  [/parentElement\s*\.\s*parentElement/, "seletor dependente de posição"],
  [/normalizeBrokenText|fixMojibakeInDOM/, "reparo de mojibake em runtime"],
  [/ðŸ|�|Ãƒ|Ã§|Ã£|Ã©|Ãª|Ã³|Ãµ/, "texto com possível mojibake"]
];

export function validateHtmlSource(source, file) {
  const errors = [];
  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(source)) {
      errors.push(`${file}: ${label} encontrado`);
    }
  }

  scripts.forEach((match, index) => {
    try {
      new Function(match[1]);
    } catch (error) {
      errors.push(`${file}: script ${index + 1} inválido: ${error.message}`);
    }
  });

  if (file.includes("Digimon")) {
    const blindedConditions = source.match(/value="Ofuscado"/g) || [];
    if (blindedConditions.length !== 1) {
      errors.push(`${file}: esperado exatamente um valor de condição Ofuscado`);
    }
  }

  return errors;
}

export async function runSourceValidation() {
  const errors = [];

  for (const file of files) {
    const source = await readFile(path.join(projectRoot, file), "utf8");
    errors.push(...validateHtmlSource(source, file));
  }

  errors.forEach((error) => console.error(error));
  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("Fontes HTML e JavaScript validadas.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await runSourceValidation();
}
