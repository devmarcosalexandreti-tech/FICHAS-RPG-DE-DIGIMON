# Auditoria Técnica — Fichas HTML ASAFE

> **Documento histórico:** este relatório registra o estado encontrado em 25 de setembro de 2026, antes das correções posteriores. Para instalação, testes e estado operacional atual, consulte `README.md` e `TESTING.md`.

**Data da auditoria:** 25 de setembro de 2026  
**Escopo:** repositório local completo, sem alteração de código-fonte, configuração ou artefatos existentes  
**Branch auditada:** `improve/audit-roadmap`  
**HEAD auditado:** `6aea6a9` (`test: expand sheet regression coverage`)  
**Branch principal local:** `master` em `8af0eda`  

## Estado dos achados após a remediação

Esta tabela registra o resultado posterior sem alterar o diagnóstico histórico detalhado abaixo.

| Achado | Estado atual |
| --- | --- |
| AT-01 — fontes e artefatos dessincronizados | Resolvido: build determinístico, `build:check` e artefatos versionados em conjunto |
| AT-02 — acessibilidade dos artefatos | Resolvido na automação: nomes, foco, teclado e contraste cobertos; leitor de tela real permanece manual |
| AT-03 — Playwright local e CI ausente | Resolvido: Chromium gerenciado e GitHub Actions em Windows/Node 24 |
| AT-04 — layout fixo | Aceito e documentado como escopo desktop; mobile não é anunciado como suportado |
| AT-05 — infraestrutura pública | Resolvido: remote público, README com imagens, licença MIT, CI e releases |
| AT-06 — cobertura de acessibilidade/plataformas | Parcial por decisão de escopo: automação em Chromium; leitor de tela, Firefox, WebKit e impressão documentados como não validados |
| AT-07 — estilos inline | Resolvido: estilos estáticos extraídos e `no-inline-style` reativado |
| AT-08 — modal morto | Resolvido no commit `6fcdc01` |
| AT-09 — cenários E2E extensos | Mitigado com helpers e cenários de regressão separados |
| AT-10 — falha de download | Mitigado: falhas síncronas geram mensagem e não limpam o estado sujo; bloqueios silenciosos continuam manuais |
| AT-11 — domínios numéricos | Mantido como risco potencial até definição formal das regras; limites existentes foram preservados |
| AT-12 — fim de linha | Resolvido por `.gitattributes` |

## 1. Resumo executivo

O projeto é uma aplicação front-end estática, sem framework, composta por HTML, CSS e JavaScript nativos. Durante o desenvolvimento, templates, componentes, estilos e scripts permanecem separados em `src/`; o build os incorpora em duas fichas HTML autocontidas, executáveis offline e distribuíveis como arquivos únicos.

A arquitetura atual é proporcional ao porte e ao domínio. Não há justificativa técnica para migrar para React, criar camadas de API, hooks, services ou gerenciamento global de estado: o projeto não possui backend, rotas, autenticação, chamadas de rede ou estado compartilhado complexo. A separação adotada entre fontes, componentes, lógica específica e helpers compartilhados é adequada.

O código possui pontos fortes relevantes para portfólio:

- build determinístico com validação de placeholders;
- serialização segura do estado do formulário;
- ausência de `innerHTML` e APIs equivalentes de injeção nos fontes;
- eventos registrados com `addEventListener`;
- testes unitários, funcionais e visuais;
- documentação de uso, arquitetura e regressão manual;
- nenhuma vulnerabilidade conhecida nas dependências na data desta auditoria.

O repositório **ainda não está pronto para publicação profissional** no estado operacional atual. O bloqueio principal não é arquitetural: existem 13 arquivos modificados e não commitados, os dois HTMLs distribuídos estão dessincronizados dos fontes e `npm run build:check` falha. Além disso, as correções de acessibilidade iniciadas no worktree ainda não foram materializadas nem validadas nos artefatos finais. A automação Playwright depende do Edge instalado no Windows e não há CI, remote Git ou licença.

### Classificação geral

| Dimensão | Diagnóstico |
| --- | --- |
| Funcionamento principal | Bom no último estado commitado e testado |
| Integridade do worktree atual | Reprovada: fontes e artefatos estão dessincronizados |
| Arquitetura | Adequada ao escopo; coesão boa e acoplamento controlado pelo build |
| Segurança | Boa para o modelo offline; nenhuma falha crítica confirmada |
| Testes | Boa cobertura funcional; portabilidade e acessibilidade ainda incompletas |
| Acessibilidade | Parcial; artefatos distribuídos ainda têm falhas confirmadas |
| Responsividade | Limitada a layout fixo de desktop/impressão |
| Documentação | Boa base técnica; publicação pública ainda incompleta |
| Prontidão para GitHub/LinkedIn | Condicionada às etapas 0 a 3 deste relatório |

### Severidades encontradas

- **Crítica:** nenhuma.
- **Alta:** 2 achados confirmados.
- **Média:** 5 achados confirmados ou lacunas relevantes.
- **Baixa:** 5 achados/riscos potenciais.
- **Opcional:** 4 melhorias que não devem bloquear a publicação inicial.

## 2. Estado exato do repositório

Esta distinção é necessária porque o `HEAD` e o diretório de trabalho não representam o mesmo produto.

### 2.1 Estado commitado

- `HEAD`: `6aea6a9`, na branch `improve/audit-roadmap`.
- `master`: `8af0eda`, dois commits atrás do `HEAD`.
- Commits adicionais da branch:
  - `918844f test: harden build and source guards`;
  - `6aea6a9 test: expand sheet regression coverage`.
- A suíte completa passou após o commit `6aea6a9`, antes das mudanças parciais de acessibilidade.

### 2.2 Worktree atual

Há modificações não commitadas em 13 arquivos:

```text
.htmlvalidate.json
src/components/digimon/inventory.html
src/components/digimon/modal.html
src/components/domador/inventory.html
src/components/domador/modal.html
src/components/domador/social-attributes.html
src/scripts/digimon.js
src/scripts/domador.js
src/styles/digimon.css
src/styles/domador.css
src/templates/digimon.html
src/templates/domador.html
tests/sheets.spec.js
```

O diff parcial contém 187 inserções e 143 remoções. Ele adiciona nomes acessíveis, estado de modal, ajustes de contraste e testes relacionados, mas não foi concluído, construído ou validado integralmente.

### 2.3 Verificações executadas nesta auditoria

| Verificação | Resultado atual |
| --- | --- |
| `npm run build:check` | **Falhou**: os dois HTMLs da raiz estão desatualizados |
| `npm run validate:source` | Passou |
| `npm run validate:html` | Passou sobre os HTMLs antigos da raiz |
| `npm run validate:css` | Passou sobre os HTMLs antigos da raiz |
| `npm run test:unit` | 6 de 6 testes passaram |
| `npm audit --json --package-lock-only --ignore-scripts` | 0 vulnerabilidades em 135 dependências de desenvolvimento |
| `npm test` no worktree atual | Não executado: o script começa com `npm run build` e alteraria os dois HTMLs |

O sucesso isolado dos validadores de HTML e CSS não elimina a falha de integridade: eles validaram os artefatos antigos. O gate correto é `build:check` ou a suíte completa sobre um estado que possa ser materializado.

## 3. Stack e ferramentas

| Área | Tecnologia observada |
| --- | --- |
| Interface | HTML5, CSS3 e JavaScript nativo |
| Framework | Nenhum; não é React |
| Execução | Navegador, inclusive via `file://` |
| Build | Node.js ESM, script próprio em `scripts/build.mjs` |
| Persistência | Clone do DOM e download de um novo HTML via `Blob` |
| Estado | DOM e variáveis locais dos scripts de cada ficha |
| Testes unitários | `node:test` e `node:assert` |
| Testes funcionais/visuais | Playwright 1.63 |
| Validação HTML | html-validate 11.16 |
| Validação CSS | Stylelint 17.15 com postcss-html |
| Dependências de produção | Nenhuma |
| Requisitos declarados | Node.js `>=20.17`, npm `>=10` |

Não existem API, endpoints, métodos HTTP, payloads, headers, autenticação, autorização, banco de dados, cookies, `localStorage`, `sessionStorage` ou configuração de ambiente. Esses tópicos são **não aplicáveis**, e não defeitos ausentes.

## 4. Estrutura e responsabilidades

```text
.
├── DRPG_Ficha_Digimon_v1.5.html      artefato autocontido distribuível
├── DRPG_Ficha_Domador_v1.4.html      artefato autocontido distribuível
├── src/
│   ├── templates/                    estrutura principal de cada ficha
│   ├── components/                   inventários, modais e atributos sociais
│   ├── styles/                       CSS específico e ponto compartilhado
│   └── scripts/                      comportamento específico e helpers comuns
├── scripts/                          build e guardas estáticas
├── unit-tests/                       testes do build e dos guardas
├── tests/                            fluxos E2E e snapshots visuais
├── README.md                         uso, arquitetura e manutenção
└── REGRESSION_CHECKLIST.md           roteiro manual
```

### Avaliação arquitetural

- **Coesão:** boa. `digimon.js` e `domador.js` concentram regras da ficha correspondente; `shared.js` contém funções sem estado e efetivamente comuns.
- **Acoplamento:** aceitável. Os scripts dependem de IDs/classes dos templates, mas o build e os testes funcionais exercitam esse contrato.
- **Escalabilidade:** suficiente para duas fichas e menos de 700 linhas de JavaScript. Uma migração para framework aumentaria custo e superfície de falha sem resolver um problema observado.
- **Separação de responsabilidades:** adequada ao domínio. A UI e a interação estão próximas por serem pequenas e puramente locais; serialização, download e criação de elementos foram extraídos.
- **Artefato único:** a etapa de build preserva a portabilidade offline sem impor duplicação integral nos fontes.

Tamanhos atuais relevantes: `digimon.js` tem 328 linhas, `domador.js` 240, `shared.js` 86, `digimon.css` 436 e `domador.css` 340. Esses tamanhos são moderados; não foi identificada função individual que justifique reescrita ampla.

## 5. Achados detalhados

### AT-01 — Fontes e artefatos distribuídos estão dessincronizados

- **Classificação:** falha confirmada.
- **Severidade:** alta.
- **Localização:** worktree inteiro; em especial os 12 arquivos alterados sob `src/`/configuração e `DRPG_Ficha_Digimon_v1.5.html` / `DRPG_Ficha_Domador_v1.4.html`.
- **Evidência:** `npm run build:check` informa que ambos os HTMLs estão desatualizados. `git status` mostra 13 arquivos modificados. A branch de trabalho também está dois commits à frente de `master`.
- **Impacto técnico:** o código revisado não é o mesmo entregue ao usuário. Correções existentes nos fontes não chegam aos HTMLs e validações isoladas dos artefatos podem gerar falso senso de aprovação. Publicar nesse estado torna o repositório não reprodutível.
- **Correção recomendada:** decidir se o diff parcial de acessibilidade será concluído ou descartado; depois gerar os artefatos, revisar o diff produzido, executar a suíte completa e integrar os commits na branch principal.
- **Risco de regressão da correção:** médio. O build altera os dois arquivos distribuídos e precisa ser acompanhado por testes funcionais e snapshots.

### AT-02 — Artefatos distribuídos possuem controles sem nome acessível e contraste insuficiente

- **Classificação:** falha confirmada nos HTMLs atualmente distribuídos; parcialmente mitigada, mas ainda não aceita, nos fontes não commitados.
- **Severidade:** alta.
- **Localização:**
  - `DRPG_Ficha_Digimon_v1.5.html:453-570`: vários `label` sem associação `for`/`id`;
  - `DRPG_Ficha_Domador_v1.4.html:358-420` e `480-488`: mesmo padrão;
  - `DRPG_Ficha_Digimon_v1.5.html:80`, `91`, `358`, `367`, `437`;
  - `DRPG_Ficha_Domador_v1.4.html:32`, `39`, `89`, `197`, `228`, `289`, `318`, `341`;
  - `.htmlvalidate.json:10` e `19-24`: regras foram reativadas apenas no worktree parcial.
- **Evidência:** os labels aparecem como irmãos visuais, sem associação programática. Cores antigas sobre branco incluem `#e67e22` (aprox. 2,85:1), `#7f8c8d` (aprox. 3,48:1) e `#2980b9` (aprox. 4,30:1), abaixo de 4,5:1 para texto pequeno. Os fontes atuais já adicionam parte dos IDs, nomes e novas cores, porém os artefatos permanecem antigos.
- **Impacto técnico:** leitores de tela não anunciam corretamente diversos campos; usuários com baixa visão recebem texto de baixo contraste; a alegação de acessibilidade do README não corresponde aos arquivos distribuídos.
- **Correção recomendada:** concluir o diff de acessibilidade, construir os HTMLs, validar todos os controles com nome acessível, fluxo de teclado, foco, `inert`/`aria-hidden`, contraste WCAG AA e comparar os snapshots antes de aceitar a mudança.
- **Risco de regressão da correção:** médio. IDs/labels têm baixo risco funcional, mas alterações de cor e estados do modal podem afetar aparência e navegação por teclado.

### AT-03 — Playwright depende do Edge instalado no Windows e não há CI

- **Classificação:** falha confirmada de portabilidade e processo.
- **Severidade:** média.
- **Localização:** `playwright.config.js:8-10`, `README.md:88`, `tests/visual.spec.js:14-20` e snapshots `tests/visual.spec.js-snapshots/*-win32.png`; diretório `.github/workflows` ausente.
- **Evidência:** `channel: "msedge"` exige uma instalação local específica. Os baselines são nomeados apenas para `win32`. Nenhum workflow executa `npm ci` e os testes em push/pull request.
- **Impacto técnico:** colaboradores e runners Linux não reproduzem a suíte sem alteração manual; regressões podem chegar à branch principal sem gate automatizado; screenshots variam por plataforma.
- **Correção recomendada:** usar Chromium gerenciado pelo Playwright ou uma matriz explicitamente Windows; instalar o navegador no CI; executar `npm ci`, `npm run build:check` e testes em checkout limpo; definir uma plataforma canônica para snapshots.
- **Risco de regressão da correção:** baixo para funcionalidade, médio para snapshots, que provavelmente precisarão de baseline específico e revisão visual.

### AT-04 — Layout fixo não atende telas estreitas

- **Classificação:** limitação confirmada; pode ser intencional para ficha de desktop/impressão.
- **Severidade:** média.
- **Localização:** `src/styles/digimon.css:11`, `src/styles/domador.css:10`; não existem media queries nos estilos.
- **Evidência:** `.sheet` usa `width: 800px` em ambas as fichas. O único snapshot usa viewport de 1280 × 900 em `tests/visual.spec.js:14`.
- **Impacto técnico:** em celulares e viewports menores ocorre rolagem horizontal e controles pequenos. A responsividade não pode ser declarada como qualidade do produto atual.
- **Correção recomendada:** primeiro decidir e documentar se o produto é desktop/print-first. Se mobile fizer parte do escopo, implementar responsividade incremental e adicionar snapshots/fluxos em largura estreita. Não alterar a grade sem baseline visual aprovado.
- **Risco de regressão da correção:** alto, pois mudanças de largura e quebra de grade podem alterar a aparência das fichas e a impressão.

### AT-05 — Repositório ainda não possui infraestrutura mínima de publicação pública

- **Classificação:** falha confirmada para o objetivo declarado de GitHub/LinkedIn, não para a execução local.
- **Severidade:** média.
- **Localização:** remote Git ausente; arquivos `LICENSE` e `.github/workflows/*` ausentes; `README.md:1-88`.
- **Evidência:** `git remote -v` não retorna entradas. O README documenta uso, arquitetura e comandos, mas não há licença, status de CI, screenshots reais ou link de demonstração/release.
- **Impacto técnico:** terceiros não têm permissão explícita de uso/contribuição; não existe URL pública ou prova automatizada de qualidade; a apresentação visual do portfólio fica incompleta.
- **Correção recomendada:** escolher conscientemente uma licença, criar o repositório remoto, publicar somente após CI verde e acrescentar screenshots, status do CI, matriz de suporte e instruções de release. Badges devem apontar para workflows reais.
- **Risco de regressão da correção:** baixo. O risco principal é escolher uma licença incompatível com a intenção do autor, por isso essa decisão não deve ser automatizada.

### AT-06 — Cobertura de acessibilidade e plataformas ainda é parcial

- **Classificação:** lacuna confirmada de testes.
- **Severidade:** média.
- **Localização:** `tests/sheets.spec.js:39-139` e `142-240`; `tests/visual.spec.js:7-20`.
- **Evidência:** o worktree parcial adiciona verificações manuais de nome acessível, foco, Tab/Shift+Tab e estado de modal, mas não foi executado contra artefatos atualizados. Não há scanner automatizado de acessibilidade, viewport móvel nem cenário de impressão. O visual cobre apenas duas páginas em um viewport Windows.
- **Impacto técnico:** violações semânticas e de contraste podem reaparecer sem falha automatizada; problemas específicos de mobile/impressão não são detectados.
- **Correção recomendada:** finalizar primeiro AT-01/AT-02; depois incluir auditoria automatizada de acessibilidade e uma matriz pequena de viewports realmente suportados. Manter revisão humana para contraste, ordem de foco e screenshots.
- **Risco de regressão da correção:** baixo no produto; médio de instabilidade dos testes se scanners e snapshots forem configurados sem escopo controlado.

### AT-07 — Estilos inline continuam concentrando detalhes visuais no HTML

- **Classificação:** dívida técnica confirmada.
- **Severidade:** média.
- **Localização:** 62 ocorrências em `src/`: 32 em `src/components/digimon/inventory.html`, 11 em `src/templates/digimon.html`, 7 em `src/templates/domador.html`, 6 em `src/components/domador/social-attributes.html`, 3 em `src/components/domador/inventory.html`, 2 em `src/components/domador/modal.html` e 1 em `src/components/digimon/modal.html`.
- **Evidência:** larguras, bordas, grids, tipografia e espaçamentos são repetidos em atributos `style`.
- **Impacto técnico:** manutenção visual exige editar marcação; regras equivalentes podem divergir; validadores precisam manter `no-inline-style` desativado em `.htmlvalidate.json:13`.
- **Correção recomendada:** extrair um componente por commit para classes semânticas, sempre comparando snapshots antes/depois. Não fazer substituição global, pois a ordem da cascata é parte do comportamento visual.
- **Risco de regressão da correção:** médio, principalmente por especificidade e ordem de CSS.

### AT-08 — O modal do Digimon contém marcação inicial descartada em toda abertura

- **Classificação:** código morto confirmado.
- **Severidade:** baixa.
- **Localização:** `src/components/digimon/modal.html:5-18`; `src/scripts/digimon.js:50-82`, especialmente `fields.replaceChildren()` na linha 56.
- **Evidência:** o componente entrega campos de exemplo, mas `openModalForm` esvazia `#modalFields` e recria todos os campos antes de exibir o diálogo.
- **Impacto técnico:** a marcação duplica contratos de campos e pode induzir manutenção no lugar errado; aumenta ruído e risco de inconsistência sem efeito funcional atual.
- **Correção recomendada:** após estabilizar acessibilidade, deixar o contêiner vazio no template e manter uma única fonte de verdade na construção dinâmica, ou adotar templates reais se houver justificativa. Cobrir criação e edição nos testes.
- **Risco de regressão da correção:** baixo, desde que a abertura do modal continue sendo o único caminho de exibição.

### AT-09 — Dois cenários E2E concentram muitas responsabilidades

- **Classificação:** dívida de testabilidade confirmada.
- **Severidade:** baixa.
- **Localização:** `tests/sheets.spec.js:39-139` e `142-240`.
- **Evidência:** cada teste cobre acessibilidade, cancelamento, validação, criação, edição, exclusão, inventário, condições/tiers, XSS, download, reabertura e segundo salvamento em um único fluxo longo.
- **Impacto técnico:** uma falha inicial impede observação das etapas seguintes; diagnóstico e manutenção dos cenários ficam mais lentos.
- **Correção recomendada:** extrair helpers de salvar/reabrir e dividir por capacidades, mantendo ao menos um fluxo completo por ficha. Evitar testes independentes que repitam downloads caros sem ganho.
- **Risco de regressão da correção:** médio apenas para a suíte: uma divisão incorreta pode reduzir cobertura implícita de sequência/estado.

### AT-10 — Download não expõe falha ao usuário

- **Classificação:** risco potencial, não há falha reproduzida.
- **Severidade:** baixa.
- **Localização:** `src/scripts/shared.js:75-85`, função `downloadCurrentSheet`.
- **Evidência:** criação de `Blob`, URL e clique sintético não têm tratamento de exceção ou mensagem. Nos navegadores testados o fluxo funciona e o URL é revogado.
- **Impacto técnico:** bloqueio de download, falta de suporte ou falha excepcional pode encerrar silenciosamente a ação.
- **Correção recomendada:** somente se houver caso reproduzível, usar `try/finally` para limpeza e apresentar erro não bloqueante. Preservar o nome e o conteúdo do arquivo.
- **Risco de regressão da correção:** médio, porque alterar o gesto de download pode afetar políticas do navegador.

### AT-11 — Domínios numéricos não estão completamente especificados

- **Classificação:** risco potencial; não pode ser tratado como defeito sem regra de negócio.
- **Severidade:** baixa.
- **Localização:** vários `input[type="number"]` em `src/templates/digimon.html:27-47`, `126-133` e `src/templates/domador.html:17-26`, `64-71`; `getTier` em `src/scripts/domador.js:11-14`.
- **Evidência:** alguns campos têm `min`/`max`, outros aceitam negativos, vazios ou valores muito altos. `getTier` converte entrada inválida para tier 0 e limita valores altos ao tier 5 por sua cadeia de condições.
- **Impacto técnico:** dados fora de um domínio esperado podem ser salvos, mas o domínio oficial não está documentado no repositório.
- **Correção recomendada:** confirmar as regras do sistema antes de adicionar restrições. Depois documentar limites e cobrir fronteiras. Não inventar validações de negócio.
- **Risco de regressão da correção:** alto se limites forem assumidos sem validação do autor; baixo se apenas documentados.

### AT-12 — Convenções de fim de linha não estão fixadas

- **Classificação:** risco confirmado de manutenção, sem efeito de runtime.
- **Severidade:** baixa.
- **Localização:** `.gitattributes` ausente; múltiplos avisos do Git para arquivos sob `src/` e `.htmlvalidate.json`.
- **Evidência:** `git diff --stat` informa que LF será substituído por CRLF quando o Git tocar os arquivos.
- **Impacto técnico:** diffs podem receber ruído de fim de linha entre Windows e CI Linux, prejudicando revisão e snapshots textuais.
- **Correção recomendada:** definir política em `.gitattributes` antes da publicação e normalizar em commit isolado, sem misturar com alteração funcional.
- **Risco de regressão da correção:** baixo no runtime, mas alto de ruído no diff se a normalização não for isolada.

## 6. Segurança e dependências

### Controles confirmados

- `src/scripts/shared.js:1-17` cria elementos com `textContent`, não com interpolação HTML.
- `src/scripts/shared.js:35-62` clona o documento e grava valores por APIs de DOM antes de serializar; `outerHTML` é usado como saída do clone, não para injetar entrada no documento ativo.
- `src/scripts/shared.js:65-72` remove caracteres inválidos e limita o nome do arquivo.
- `scripts/validate-source.mjs:14-25` rejeita handlers inline, `innerHTML`, `outerHTML` por atribuição, `insertAdjacentHTML`, `document.write`, `eval`, URLs `javascript:` e seletores dependentes de estilo.
- `unit-tests/build-and-guards.test.mjs:28-52` testa APIs de injeção, JavaScript inválido e script seguro.
- `tests/sheets.spec.js:7`, `39-139` e `142-240` exercita texto contendo fechamento de `textarea` e tag `script`, incluindo salvar e reabrir.
- Não foram encontradas credenciais, tokens, chamadas de rede, cookies ou armazenamento persistente no navegador.
- `npm audit` retornou zero vulnerabilidades conhecidas em 25/09/2026.

### Observação de ameaça

Os HTMLs são programas executáveis por definição. A proteção contra entrada do usuário impede que texto digitado seja promovido a script, mas não torna seguro abrir um arquivo HTML recebido de fonte não confiável. Recomenda-se registrar essa fronteira no README. A ausência de CSP não é classificada como falha neste modelo: estilos e scripts inline são requisito do artefato autocontido, e a aplicação não busca conteúdo remoto.

## 7. Tratamento de erros e casos extremos

- Os modais impedem nome vazio e apresentam mensagem junto ao formulário; o worktree parcial acrescenta `aria-invalid`.
- Cancelamento por botão e `Escape`, retorno de foco, exclusão e segundo salvamento estão cobertos nos cenários Playwright.
- O nome do arquivo possui fallback e sanitização.
- O build rejeita placeholder ausente ou duplicado, reduzindo risco de artefato incompleto.
- Não existem estados de carregamento porque não há operação assíncrona de rede.
- O listener `beforeunload` protege alterações não salvas; o download marca o estado como salvo nos scripts específicos.

Não foi observada perda de dados reproduzível no fluxo coberto. AT-10 e AT-11 permanecem riscos potenciais, não falhas comprovadas.

## 8. Performance

Não foi identificado gargalo relevante.

- Os artefatos são pequenos, locais e não carregam dependências externas.
- Clonar o DOM inteiro ocorre somente no comando de salvar e é aceitável para fichas desse porte.
- Delegação de eventos é usada em listas dinâmicas.
- Listeners globais de `input`/`change` e ajuste de altura de textarea têm custo desprezível com a quantidade atual de controles.
- Não há rede, imagens pesadas, timers contínuos, animações complexas ou processamento intensivo.

Micro-otimizações não devem ser priorizadas. O risco maior está em introduzir complexidade sem ganho mensurável.

## 9. Testes e qualidade

### Cobertura existente

- 6 testes unitários para placeholders e guardas de fonte.
- 2 fluxos E2E extensos, um por ficha.
- 2 testes visuais, um por ficha.
- Cobertura funcional de tiers, condições, poder, habilidade, inventário, validação, cancelamento, exclusão, XSS, download, reabertura e segundo salvamento.
- Checklist manual em `REGRESSION_CHECKLIST.md`.

### Lacunas

- CI ausente.
- Browser/plataforma não portáveis.
- Acessibilidade parcial e ainda não validada no artefato atual.
- Sem cenário móvel ou impressão.
- Sem métrica de cobertura; para este projeto, cobertura E2E orientada a fluxos é mais relevante do que perseguir percentual arbitrário.
- Sem lint geral de JavaScript/formatador. Trata-se de melhoria opcional, pois o validador próprio já cobre riscos específicos e o volume de JS é pequeno.

## 10. Documentação e apresentação de portfólio

O README já explica finalidade, uso offline, comandos, estrutura, decisão arquitetural e convenções. Isso é uma base acima da média para o porte do projeto. Antes da publicação, ele deve refletir apenas capacidades verificadas no artefato final.

Itens necessários para publicação profissional:

1. estado Git limpo e reproduzível;
2. CI verde em checkout limpo;
3. licença escolhida pelo autor;
4. screenshots reais das duas fichas;
5. seção curta de decisões técnicas e segurança;
6. matriz de navegadores/plataformas efetivamente testados;
7. releases ou anexos contendo os dois HTMLs finais;
8. link do repositório e, se desejado, demonstração estática compatível com o funcionamento via download.

Sugestões opcionais: badge de CI, changelog e template de issue. Não se recomenda badge sem workflow real, nem documentação extensa sem processo correspondente.

## 11. Plano de execução por dependências

### Etapa 0 — Recuperar uma linha de base íntegra

**Prioridade:** imediata.  
**Dependência:** nenhuma.

1. Revisar o diff parcial dos 13 arquivos.
2. Decidir entre concluir ou remover a Fase 3 parcial, sem misturar abordagens.
3. Gerar os dois HTMLs a partir dos fontes aceitos.
4. Executar validação, testes unitários, E2E e visuais.
5. Criar commits pequenos e integrar `improve/audit-roadmap` em `master`.

**Critérios de aceitação:**

- `git status --short` vazio;
- `npm run build:check` passa;
- `npm test` passa em checkout limpo;
- `master` contém os commits aceitos;
- HTMLs distribuídos correspondem byte a byte ao build dos fontes.

### Etapa 1 — Concluir acessibilidade sem alterar regras da ficha

**Prioridade:** alta.  
**Dependência:** etapa 0 ou incorporação controlada do diff parcial atual.

1. Associar todos os labels e fornecer nome acessível a controles sem texto.
2. Finalizar ciclo de foco, `Escape`, retorno de foco, `aria-hidden` e `inert` dos modais.
3. Corrigir contrastes abaixo de WCAG AA sem alterar estrutura visual.
4. Reativar regras pertinentes do html-validate.
5. Validar teclado completo e leitor de tela de forma manual.

**Critérios de aceitação:**

- nenhum input, textarea, select ou botão sem nome acessível;
- foco não entra em modal oculto e não escapa do modal aberto;
- texto normal atinge contraste mínimo de 4,5:1;
- todos os fluxos funcionais permanecem iguais;
- snapshots revisados conscientemente, sem aprovação automática de diferenças inesperadas.

### Etapa 2 — Tornar testes portáveis e criar CI

**Prioridade:** alta para publicação.  
**Dependência:** etapas 0 e 1.

1. Definir Chromium Playwright instalável ou runner Windows oficial.
2. Definir plataforma canônica dos snapshots.
3. Criar workflow para instalação limpa e suíte completa.
4. Provar execução a partir de `npm ci`, sem dependência do ambiente do autor.

**Critérios de aceitação:**

- workflow executa em push e pull request;
- `npm ci` seguido dos checks passa em ambiente limpo;
- nenhuma edição manual de `playwright.config.js` é necessária;
- falha de build desatualizado bloqueia o merge;
- baselines visuais têm plataforma e política de atualização documentadas.

### Etapa 3 — Preparar publicação e documentação

**Prioridade:** média/alta.  
**Dependência:** CI funcional.

1. Escolher licença.
2. Criar remote e publicar a branch principal estável.
3. Atualizar README com screenshots, suporte e badges reais.
4. Criar release com os HTMLs autocontidos.
5. Registrar a fronteira de segurança para arquivos recebidos de terceiros.

**Critérios de aceitação:**

- repositório público acessível e CI verde;
- licença explícita;
- README permite usar e desenvolver o projeto do zero;
- release contém exatamente os artefatos gerados pelo commit marcado;
- nenhum segredo, caminho local ou arquivo de teste temporário versionado.

### Etapa 4 — Limpeza incremental

**Prioridade:** posterior à publicação básica.  
**Dependência:** snapshots confiáveis.

1. Remover marcação morta do modal Digimon.
2. Extrair estilos inline por componente.
3. Dividir cenários E2E longos preservando os fluxos completos.
4. Adicionar `.gitattributes` em commit isolado.
5. Avaliar lint/formatador de JavaScript com configuração compatível com scripts concatenados.

**Critérios de aceitação:**

- um componente por commit;
- nenhuma mudança funcional ou visual não intencional;
- suíte funcional e visual verde após cada commit;
- redução mensurável de estilos inline e duplicação;
- diffs futuros sem ruído de fim de linha.

### Etapa 5 — Melhorias opcionais de produto

**Prioridade:** opcional.  
**Dependência:** decisão explícita de escopo.

- layout responsivo, se mobile for requisito;
- teste/folha de impressão, se impressão for fluxo oficial;
- tratamento visual de falha de download, caso reproduzido;
- validações numéricas somente após confirmação das regras do jogo;
- scanner automatizado de acessibilidade com baseline controlado.

## 12. Matriz de verificação recomendada

```powershell
npm ci
npm run build:check
npm run validate:source
npm run validate:html
npm run validate:css
npm run test:unit
npm run test:e2e
npm test
npm audit --package-lock-only --ignore-scripts
git status --short
```

Verificações manuais obrigatórias antes de release:

- abrir cada HTML diretamente no navegador;
- preencher campos comuns e extremos;
- adicionar, editar, cancelar e excluir itens;
- testar tiers e condições;
- salvar, reabrir, alterar e salvar novamente;
- inserir texto com `<script>`, fechamento de `textarea`, aspas, `&` e caracteres acentuados;
- operar todos os controles somente por teclado;
- verificar foco e mensagens dos modais;
- revisar contraste e screenshots em 100% de zoom;
- confirmar aparência e legibilidade no tamanho de tela oficialmente suportado;
- confirmar que os arquivos baixados não executam a entrada digitada como código.

## 13. Priorização final

| Ordem | ID | Ação | Natureza | Severidade |
| ---: | --- | --- | --- | --- |
| 1 | AT-01 | Sincronizar fontes, artefatos, commits e `master` | Falha confirmada | Alta |
| 2 | AT-02 | Concluir e validar acessibilidade nos HTMLs finais | Falha confirmada | Alta |
| 3 | AT-03 | Remover dependência local do Edge e criar CI | Falha de processo | Média |
| 4 | AT-05 | Adicionar licença, remote e apresentação pública | Falha para o objetivo | Média |
| 5 | AT-06 | Ampliar verificações de acessibilidade/plataforma | Lacuna de testes | Média |
| 6 | AT-07 | Extrair estilos inline incrementalmente | Dívida técnica | Média |
| 7 | AT-04 | Definir suporte mobile e agir conforme o escopo | Limitação confirmada | Média |
| 8 | AT-08 | Remover marcação morta do modal | Código morto | Baixa |
| 9 | AT-09 | Modularizar testes E2E longos | Dívida de testes | Baixa |
| 10 | AT-12 | Fixar fim de linha | Risco de manutenção | Baixa |
| 11 | AT-10 | Tratar falha de download se reproduzida | Risco potencial | Baixa |
| 12 | AT-11 | Especificar domínios numéricos | Risco potencial | Baixa |

## 14. Conclusão

O projeto não sofre de inadequação arquitetural nem exige reescrita. A solução técnica de fontes modulares com geração de HTMLs autocontidos preserva corretamente o principal requisito do produto. Segurança de entrada, persistência offline e cobertura dos fluxos críticos estão em bom nível para o porte.

O trabalho prioritário é operacional: concluir ou retirar o diff parcial, restaurar a correspondência entre fontes e artefatos e provar tudo em CI reproduzível. Depois disso, acessibilidade final, licença e apresentação visual transformam a base existente em um portfólio publicável sem alterar regras de negócio ou experiência consolidada.
