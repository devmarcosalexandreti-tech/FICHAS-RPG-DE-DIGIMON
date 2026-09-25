import { test, expect } from "@playwright/test";

import { SHEET_CASES, expectAccessibleControls, openSheet } from "./helpers/sheets.js";

const contrastSamples = {
  Digimon: [
    ["rótulo de campo", ".box label"],
    ["valor de campo", ".box input"],
    ["botão de download", "#btnSalvar"]
  ],
  Domador: [
    ["rótulo de campo", ".box label"],
    ["valor de campo", ".box input"],
    ["barra de seção", ".title-bar"]
  ]
};

async function getContrast(locator) {
  return locator.evaluate((element) => {
    const parseColor = (value) => {
      const channels = value.match(/[\d.]+/g)?.map(Number) || [];
      return {
        rgb: channels.slice(0, 3),
        alpha: channels[3] ?? 1
      };
    };
    const luminance = (rgb) => {
      const linear = rgb
        .map((channel) => channel / 255)
        .map((channel) => channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4);
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };

    const foregroundValue = getComputedStyle(element).color;
    const foreground = parseColor(foregroundValue).rgb;
    let current = element;
    let backgroundValue = "rgb(255, 255, 255)";

    while (current) {
      const candidate = getComputedStyle(current).backgroundColor;
      if (parseColor(candidate).alpha > 0) {
        backgroundValue = candidate;
        break;
      }
      current = current.parentElement;
    }

    const background = parseColor(backgroundValue).rgb;
    const light = Math.max(luminance(foreground), luminance(background));
    const dark = Math.min(luminance(foreground), luminance(background));
    return {
      foreground: foregroundValue,
      background: backgroundValue,
      ratio: (light + 0.05) / (dark + 0.05)
    };
  });
}

for (const sheet of SHEET_CASES) {
  test(`${sheet.name}: controles têm nome e textos principais atingem contraste AA`, async ({ page }) => {
    await openSheet(page, sheet.filename);
    await expectAccessibleControls(page);

    for (const [label, selector] of contrastSamples[sheet.name]) {
      const contrast = await getContrast(page.locator(selector).first());
      expect(
        contrast.ratio,
        `${label}: ${contrast.foreground} sobre ${contrast.background}`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
}
