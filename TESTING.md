# Estratégia de testes

O projeto combina testes Node para o pipeline de build com testes Playwright sobre os dois HTMLs autocontidos. Como não há API, backend, autenticação ou banco de dados, não existem serviços externos ou dados de produção a simular.

## Instalação reproduzível

O ambiente canônico de desenvolvimento e CI usa Node.js 24.8 ou superior.

```powershell
npm ci
npx playwright install chromium
```

Downloads gerados durante os testes são gravados no diretório temporário de cada execução do Playwright e não alteram os artefatos da raiz.

## Comandos

```powershell
npm run build:check
npm run validate
npm run test:unit
npm run test:unit:coverage
npm run test:e2e
npm test
```

`npm test` gera os HTMLs, valida fontes/HTML/CSS e executa as suítes Node e Playwright. No CI, `build:check` roda antes desse comando para rejeitar artefatos desatualizados.

## Camadas de teste

### Build e guardas

`unit-tests/build-and-guards.test.mjs` cobre:

- placeholders obrigatórios ausentes, duplicados e válidos;
- rejeição de APIs de injeção e handlers inline;
- detecção de JavaScript inválido;
- aceitação de script seguro;
- execução do build check fora do diretório do projeto.

A cobertura produzida por `test:unit:coverage` se limita aos módulos Node importados por essa suíte. Ela não representa a cobertura do JavaScript executado dentro do navegador.

### Fluxos funcionais

`tests/sheets.spec.js` cobre os fluxos completos de Digimon e Domador:

- criação, edição, exclusão e cancelamento;
- inventário, poderes, condições e tiers;
- validação e foco dos modais;
- salvar, reabrir e salvar novamente;
- persistência de campos e proteção contra entrada com `<script>`.

`tests/regressions.spec.js` isola riscos que não devem depender dos cenários longos:

- aviso de alterações não salvas;
- nomes compostos apenas por espaços;
- cancelamento de edição sem mutação do item;
- fallback e sanitização do nome baixado;
- falha síncrona de download sem perda do aviso de alterações não salvas;
- continuidade das linhas de inventário após reabrir;
- unicidade e fechamento da lista de condições.

### Acessibilidade e visual

`tests/accessibility.spec.js` verifica nomes acessíveis de controles e contraste mínimo de 4,5:1 para amostras representativas da interface renderizada.

`tests/visual.spec.js` compara as duas fichas com snapshots Windows/Chromium. Um snapshot só deve ser atualizado depois de inspeção do esperado, recebido e diff. Mudanças de baseline não podem ser usadas para ocultar regressões.

## Compatibilidade verificada

| Ambiente | Cobertura |
| --- | --- |
| Windows + Chromium | Funcional, acessibilidade automatizada e visual |
| Arquivos locais `file://` | Salvar, reabrir e segundo salvamento |
| Firefox e WebKit | Não executados |
| Viewport móvel | Não suportado atualmente |
| Impressão | Não executada |

## Qualidade estática de JavaScript

O projeto usa `scripts/validate-source.mjs` para validar a sintaxe dos scripts incorporados e rejeitar APIs incompatíveis com a política de segurança. ESLint foi avaliado, mas não foi adicionado: os scripts clássicos são concatenados pelo build e compartilham funções globais controladas, o que exigiria uma configuração paralela com baixo ganho no volume atual. A decisão deve ser revista se os módulos crescerem ou passarem a usar ESM no navegador.

## Validação manual remanescente

- leitura dos formulários com leitor de tela real;
- percepção de contraste e ordem de foco por uma pessoa usuária;
- impressão, caso se torne um fluxo oficialmente suportado;
- layout móvel, que ainda não faz parte do escopo declarado;
- bloqueios silenciosos de download impostos por políticas específicas do navegador.
