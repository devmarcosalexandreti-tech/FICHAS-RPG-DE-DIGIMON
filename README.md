# Fichas HTML ASAFE

Fichas autocontidas de Digimon e Domador para preenchimento no navegador. Cada arquivo reúne HTML, CSS e JavaScript e pode ser distribuído, preenchido, baixado e reaberto sem servidor ou dependências externas.

## Arquivos principais

- `DRPG_Ficha_Digimon_v1.5.html`: ficha de Digimon.
- `DRPG_Ficha_Domador_v1.4.html`: ficha de Domador.
- `REGRESSION_CHECKLIST.md`: roteiro de validação manual.
- `tests/sheets.spec.js`: testes dos fluxos críticos com Playwright.

## Uso

1. Abra a ficha desejada diretamente em um navegador moderno.
2. Preencha os campos e use os botões `+` para inventário, habilidades ou poderes.
3. Clique em `Baixar Ficha`.
4. Abra o HTML baixado para continuar a edição.

O download contém o estado atual dos campos. Entradas do usuário são serializadas como texto ou atributos escapados e não são interpretadas como HTML executável.

## Validação e acessibilidade

Os modais exigem apenas o nome da habilidade ou do poder; os demais campos continuam opcionais. Erros são exibidos junto ao formulário, sem alertas bloqueantes. Ao abrir um modal, o foco vai para `Nome`; `Tab` permanece dentro do diálogo, `Esc` fecha e o foco retorna ao controle que iniciou a ação.

Botões representados apenas por `+`, `X` ou ícone possuem nomes acessíveis e dicas de contexto. O seletor de condições do Digimon expõe seu estado aberto ou fechado por `aria-expanded`.

## Desenvolvimento

Pré-requisitos: Node.js 20 ou superior e npm.

```powershell
npm ci
npm test
```

Comandos disponíveis:

- `npm run validate`: valida JavaScript embutido, marcação HTML e CSS.
- `npm run test:e2e`: executa os fluxos Playwright.
- `npm test`: executa todas as validações e testes.

## Decisão de arquitetura

CSS e JavaScript permanecem embutidos intencionalmente. Separá-los em `shared.css` e `shared.js` reduziria duplicação entre as duas fichas, mas faria o arquivo baixado depender de recursos externos e perderia a portabilidade que define o projeto.

As rotinas repetidas dentro de cada arquivo foram consolidadas em helpers para criação de elementos, serialização do formulário, sanitização de nomes e download.

Os testes usam o canal `msedge` do Playwright para aproveitar o Microsoft Edge instalado no Windows. Em ambientes sem Edge, remova `channel: "msedge"` de `playwright.config.js` e execute `npx playwright install chromium`.
