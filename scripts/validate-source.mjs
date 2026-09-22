import { readFile } from "node:fs/promises";

const files = [
  "DRPG_Ficha_Digimon_v1.5.html",
  "DRPG_Ficha_Domador_v1.4.html"
];

const forbiddenPatterns = [
  [/\son(?:click|change|input|submit)=/i, "handler inline"],
  [/\.(?:onclick|onchange|oninput|onsubmit)\s*=/, "handler atribuído por propriedade"],
  [/\.innerHTML\s*=/, "atribuição a innerHTML"],
  [/querySelector(?:All)?\([^)]*style\*=/, "seletor dependente de estilo"],
  [/parentElement\s*\.\s*parentElement/, "seletor dependente de posição"],
  [/normalizeBrokenText|fixMojibakeInDOM/, "reparo de mojibake em runtime"],
  [/ðŸ|�|Ãƒ|Ã§|Ã£|Ã©|Ãª|Ã³|Ãµ/, "texto com possível mojibake"]
];

let failed = false;

for (const file of files) {
  const source = await readFile(file, "utf8");
  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(source)) {
      console.error(`${file}: ${label} encontrado`);
      failed = true;
    }
  }

  scripts.forEach((match, index) => {
    try {
      new Function(match[1]);
    } catch (error) {
      console.error(`${file}: script ${index + 1} inválido: ${error.message}`);
      failed = true;
    }
  });

  if (file.includes("Digimon")) {
    const blindedConditions = source.match(/value="Ofuscado"/g) || [];
    if (blindedConditions.length !== 1) {
      console.error(`${file}: esperado exatamente um valor de condição Ofuscado`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("Fontes HTML e JavaScript validadas.");
