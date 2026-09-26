# Contribuindo

Obrigado pelo interesse em melhorar as Fichas HTML ASAFE. O requisito principal do projeto é manter cada ficha final como um único HTML editável, baixável e reabrível sem servidor.

## Preparação

Pré-requisitos: Node.js 24.8 ou superior, npm 10 ou superior e Git.

```powershell
npm ci
npx playwright install chromium
npm run build:check
npm test
```

## Fonte de verdade

- Faça alterações em `src/`, não diretamente nos HTMLs da raiz.
- Execute `npm run build` depois de alterar templates, componentes, CSS ou JavaScript.
- Inclua os HTMLs regenerados no mesmo commit dos fontes correspondentes.
- Preserve o encoding UTF-8 e a política de fim de linha definida em `.gitattributes`.

## Escopo das mudanças

- Preserve regras de negócio, layout e persistência salvo quando houver defeito comprovado.
- Prefira mudanças pequenas, com uma responsabilidade por commit.
- Não adicione framework, dependência ou abstração sem benefício demonstrável.
- Use `addEventListener`, classes ou atributos `data-*` estáveis e APIs seguras de DOM.
- Não use `innerHTML` ou handlers inline com conteúdo controlado pelo usuário.

## Testes

Antes de abrir uma contribuição:

```powershell
npm run build:check
npm run validate
npm run test:unit
npm run test:e2e
```

Novos campos persistentes devem ser cobertos por salvar e reabrir. Correções de bugs devem incluir um teste de regressão quando possível.

Snapshots só podem ser atualizados depois de comparar a imagem esperada, a recebida e o diff. Não aceite um novo baseline apenas para fazer o teste passar.

## Checklist da contribuição

- [ ] A alteração possui escopo único e justificativa clara.
- [ ] Os HTMLs gerados correspondem aos fontes.
- [ ] Validação e testes automatizados passam.
- [ ] O checklist manual relevante foi executado.
- [ ] Não há credenciais, dados pessoais, logs ou arquivos locais no diff.
- [ ] Mudanças visuais foram revisadas e documentadas.

## Segurança

Não abra uma issue pública contendo credenciais ou detalhes que facilitem exploração. Siga [SECURITY.md](SECURITY.md) e use o relato privado de vulnerabilidade do GitHub.
