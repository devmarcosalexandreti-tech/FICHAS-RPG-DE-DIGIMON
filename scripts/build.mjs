import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), "..");

const sheets = [
  {
    output: "DRPG_Ficha_Digimon_v1.5.html",
    template: "src/templates/digimon.html",
    style: "src/styles/digimon.css",
    script: "src/scripts/digimon.js",
    components: {
      "{{COMPONENT_INVENTORY}}": "src/components/digimon/inventory.html",
      "{{COMPONENT_MODAL}}": "src/components/digimon/modal.html"
    }
  },
  {
    output: "DRPG_Ficha_Domador_v1.4.html",
    template: "src/templates/domador.html",
    style: "src/styles/domador.css",
    script: "src/scripts/domador.js",
    components: {
      "{{COMPONENT_SOCIAL_ATTRIBUTES}}": "src/components/domador/social-attributes.html",
      "{{COMPONENT_INVENTORY}}": "src/components/domador/inventory.html",
      "{{COMPONENT_MODAL}}": "src/components/domador/modal.html"
    }
  }
];

async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

export function replaceRequiredPlaceholder(source, placeholder, replacement, sourceLabel) {
  let occurrences = 0;
  let position = source.indexOf(placeholder);

  while (position !== -1) {
    occurrences += 1;
    position = source.indexOf(placeholder, position + placeholder.length);
  }

  if (occurrences !== 1) {
    throw new Error(`${sourceLabel}: esperado exatamente um placeholder ${placeholder}; encontrado(s): ${occurrences}`);
  }

  return source.replace(placeholder, replacement);
}

function composeEmbeddedAsset(sharedAsset, pageAsset) {
  const endOfLine = pageAsset.includes("\r\n") ? "\r\n" : "\n";
  const normalize = (asset) => asset
    .replace(/\r?\n/g, endOfLine)
    .replace(/^(?:\r?\n)+/, "")
    .replace(/\s+$/, "");
  const body = [normalize(sharedAsset), normalize(pageAsset)]
    .filter(Boolean)
    .join(endOfLine + endOfLine);

  return endOfLine + body + endOfLine + "    ";
}

export async function renderSheet(sheet) {
  let output = await read(sheet.template);
  const sharedStyle = await read("src/styles/shared.css");
  const pageStyle = await read(sheet.style);
  const sharedScript = await read("src/scripts/shared.js");
  const pageScript = await read(sheet.script);

  output = replaceRequiredPlaceholder(
    output,
    "{{STYLES}}",
    composeEmbeddedAsset(sharedStyle, pageStyle),
    sheet.template
  );
  output = replaceRequiredPlaceholder(
    output,
    "{{SCRIPTS}}",
    composeEmbeddedAsset(sharedScript, pageScript),
    sheet.template
  );

  for (const [placeholder, componentPath] of Object.entries(sheet.components)) {
    output = replaceRequiredPlaceholder(output, placeholder, await read(componentPath), sheet.template);
  }

  const unresolved = output.match(/{{[A-Z0-9_]+}}/g);
  if (unresolved) {
    throw new Error(`${sheet.template}: placeholders não resolvidos: ${unresolved.join(", ")}`);
  }

  return output;
}

export async function runBuild({ checkOnly = false } = {}) {
  let stale = false;

  for (const sheet of sheets) {
    const rendered = await renderSheet(sheet);
    const outputPath = path.join(projectRoot, sheet.output);

    if (checkOnly) {
      const current = await read(sheet.output);
      if (current !== rendered) {
        console.error(`${sheet.output} está desatualizado. Execute npm run build.`);
        stale = true;
      }
    } else {
      await writeFile(outputPath, rendered, "utf8");
      console.log(`${sheet.output} gerado.`);
    }
  }

  if (stale) process.exitCode = 1;
  if (checkOnly && !stale) console.log("HTMLs gerados estão atualizados.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await runBuild({ checkOnly: process.argv.includes("--check") });
}
