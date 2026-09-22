# Checklist manual de regressão

Execute este roteiro nos dois arquivos após alterações de HTML, CSS ou JavaScript.

## Carregamento e apresentação

- [ ] A ficha abre diretamente pelo arquivo HTML sem mensagens de erro.
- [ ] Textos acentuados e os ícones aparecem corretamente.
- [ ] Não há campos, botões ou títulos sobrepostos.
- [ ] O console do navegador não apresenta erros.

## Campos e estado

- [ ] Campos de texto, números e anotações aceitam edição.
- [ ] No Digimon, condições podem ser abertas, marcadas e desmarcadas.
- [ ] No Domador, pontos sociais atualizam tier e título.
- [ ] Alterações ativam o aviso ao tentar fechar a página sem salvar.

## Inventário, habilidades e poderes

- [ ] Uma linha de inventário pode ser adicionada e preenchida.
- [ ] Ao abrir um modal, o foco vai para o campo `Nome`.
- [ ] Confirmar sem nome exibe mensagem inline, marca o campo inválido e não fecha o modal.
- [ ] `Tab` e `Shift+Tab` mantêm o foco dentro do modal aberto.
- [ ] Uma habilidade pode ser criada, visualizada, editada e excluída.
- [ ] O modal pode ser cancelado pelo botão e pela tecla `Esc`.
- [ ] Ao fechar o modal, o foco retorna ao botão que o abriu.
- [ ] No Digimon, um poder pode ser criado, editado e excluído.

## Salvamento e reabertura

- [ ] `Baixar Ficha` gera um arquivo `.html` com nome válido.
- [ ] Nome, campos numéricos, anotações, condições e inventário persistem.
- [ ] Habilidades e poderes persistem com os botões de edição e exclusão funcionais.
- [ ] A ficha reaberta pode ser editada e salva novamente.

## Segurança e encoding

- [ ] Testar em nome, descrição e anotações: `<script>alert(1)</script>`.
- [ ] O texto acima aparece literalmente e nenhum alerta é executado.
- [ ] Testar aspas, apóstrofo, `&`, `<`, `>` e `</textarea>`.
- [ ] Os caracteres persistem corretamente após salvar e reabrir.
- [ ] Não aparecem sequências de mojibake como `Ã`, `Â`, `ðŸ` ou `�`.
