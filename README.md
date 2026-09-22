# Fichas HTML ASAFE

Fichas autocontidas de Digimon e Domador para preenchimento no navegador. Cada arquivo reúne HTML, CSS e JavaScript e pode ser distribuído, preenchido, baixado e reaberto sem servidor ou dependências externas.

## Arquivos principais

- `DRPG_Ficha_Digimon_v1.5.html`: ficha de Digimon.
- `DRPG_Ficha_Domador_v1.4.html`: ficha de Domador.
- `src/`: fontes organizadas usadas para gerar as fichas.
- `scripts/build.mjs`: incorpora componentes, estilos e scripts nos HTMLs finais.
- `REGRESSION_CHECKLIST.md`: roteiro de validação manual.
- `tests/sheets.spec.js`: testes dos fluxos críticos com Playwright.
- `tests/visual.spec.js`: comparação visual das duas fichas.

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
npm run build
npm test
```

Comandos disponíveis:

- `npm run build`: gera os dois HTMLs autocontidos a partir de `src/`.
- `npm run build:check`: verifica se os HTMLs gerados estão atualizados.
- `npm run validate`: verifica o build e valida JavaScript, marcação HTML e CSS.
- `npm run test:e2e`: executa os fluxos Playwright.
- `npm test`: gera os artefatos e executa todas as validações e testes.

Os HTMLs da raiz são artefatos de distribuição. Alterações devem ser feitas em `src/` e materializadas com `npm run build`.

## Estrutura de fontes

```text
src/
  components/digimon/   inventário e modal
  components/domador/   atributos sociais, inventário e modal
  scripts/              lógica específica e helpers compartilhados
  styles/               estilos específicos e ponto de extensão compartilhado
  templates/            estrutura principal de cada ficha
```

O projeto é uma aplicação estática sem React, API, navegação ou sistema de tipos. Por isso, diretórios vazios de hooks, services e types não foram criados. A separação segue as responsabilidades que existem de fato no código.

## Decisão de arquitetura

HTML, CSS e JavaScript são mantidos em fontes separadas durante o desenvolvimento. O build incorpora tudo nos dois HTMLs finais, preservando o uso offline, o download e a reabertura sem arquivos auxiliares.

Helpers sem estado para criação de elementos, contenção de foco, serialização segura, sanitização de nomes e download ficam em `src/scripts/shared.js`. Regras e estado de cada ficha permanecem nos scripts específicos.

### Avaliação de CSS/JS compartilhado

| Alternativa | Vantagem | Limitação | Decisão |
| --- | --- | --- | --- |
| `shared.css` e `shared.js` externos | Uma única fonte comum | Quebra a portabilidade quando o HTML é movido | Não usar nos artefatos finais |
| Duplicação integral nos HTMLs-fonte | Dispensa build | Aumenta custo e risco de manutenção | Substituída |
| Fontes compartilhadas com etapa de build | Centraliza manutenção e mantém HTMLs autocontidos | Exige gerar artefatos após alterações | Adotada |

O CSS visual continua específico por ficha. Regras parecidas possuem diferenças de valores e posição na cascata; movê-las agora criaria risco de regressão visual sem eliminar duplicação equivalente. `src/styles/shared.css` fica reservado para regras cuja equivalência seja comprovada por testes visuais.

## Convenções de manutenção

- Eventos devem ser registrados com `addEventListener`; handlers inline e propriedades como `.onclick` são rejeitados pelo validador.
- Elementos dinâmicos devem usar classes ou atributos `data-*` estáveis.
- Seletores não devem depender de estilos inline nem de cadeias como `parentElement.parentElement`.
- Novos campos persistentes devem ser cobertos pelo fluxo de salvar e reabrir no Playwright.
- Componentes compartilhados só devem conter comportamento idêntico nas duas fichas.
- Os HTMLs gerados não devem ser editados manualmente.

Os testes usam o canal `msedge` do Playwright para aproveitar o Microsoft Edge instalado no Windows. Em ambientes sem Edge, remova `channel: "msedge"` de `playwright.config.js` e execute `npx playwright install chromium`.
