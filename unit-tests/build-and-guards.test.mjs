import assert from "node:assert/strict";
import test from "node:test";

import { replaceRequiredPlaceholder } from "../scripts/build.mjs";
import { validateHtmlSource } from "../scripts/validate-source.mjs";

test("replaceRequiredPlaceholder substitui uma ocorrência", () => {
  assert.equal(
    replaceRequiredPlaceholder("antes {{VALUE}} depois", "{{VALUE}}", "conteúdo", "template.html"),
    "antes conteúdo depois"
  );
});

test("replaceRequiredPlaceholder rejeita placeholder ausente", () => {
  assert.throws(
    () => replaceRequiredPlaceholder("sem marcador", "{{VALUE}}", "conteúdo", "template.html"),
    /encontrado\(s\): 0/
  );
});

test("replaceRequiredPlaceholder rejeita placeholder duplicado", () => {
  assert.throws(
    () => replaceRequiredPlaceholder("{{VALUE}} e {{VALUE}}", "{{VALUE}}", "conteúdo", "template.html"),
    /encontrado\(s\): 2/
  );
});

test("validateHtmlSource rejeita APIs de injeção", () => {
  const unsafeSources = [
    "<script>node.innerHTML = value;</script>",
    "<script>node.outerHTML = value;</script>",
    "<script>node.insertAdjacentHTML('beforeend', value);</script>",
    "<script>document.write(value);</script>",
    "<script>eval(value);</script>",
    "<a href=\"javascript:alert(1)\">teste</a>",
    "<button onmouseover=\"run()\">teste</button>"
  ];

  unsafeSources.forEach((source) => {
    assert.notEqual(validateHtmlSource(source, "sheet.html").length, 0, source);
  });
});

test("validateHtmlSource rejeita JavaScript inválido", () => {
  const errors = validateHtmlSource("<script>const valor = ;</script>", "sheet.html");
  assert.match(errors.join("\n"), /script 1 inválido/);
});

test("validateHtmlSource aceita script seguro", () => {
  assert.deepEqual(
    validateHtmlSource("<script>const valor = document.createElement('span');</script>", "sheet.html"),
    []
  );
});
