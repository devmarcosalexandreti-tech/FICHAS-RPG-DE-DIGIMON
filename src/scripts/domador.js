
        const titulosData = {
            "Charme": ["Sem graça", "Notável", "Presença", "Chamativo", "Elegante", "Charmoso"],
            "Conhecimento": ["Preguiçoso", "Entendido", "Estudado", "Acadêmico", "Enciclopédico", "Erudito"],
            "Coragem": ["Covarde", "Arrojado", "Determinado", "Bravo", "Corajoso", "Destemido"],
            "Disciplina": ["Desatento", "Ciente", "Persistente", "Minucioso", "Perito", "Magistral"],
            "Empatia": ["Indiferente", "Inofensivo", "Gentil", "Generoso", "Altruista", "Angelical"],
            "Expressão": ["Monótona", "Rudimentar", "Eloquente", "Persuasivo", "Inspirador", "Fascinante"]
        };

        function getTier(pts) {
            if (pts >= 80) return 5; if (pts >= 55) return 4; if (pts >= 30) return 3;
            if (pts >= 15) return 2; if (pts >= 5) return 1; return 0;
        }

        function updateAttr(nome) {
            const el = document.getElementById(`pts-${nome}`);
            const val = parseInt(el.value) || 0;
            const tier = getTier(val);
            document.getElementById(`t-${nome}`).innerText = `TIER ${tier}`;
            document.getElementById(`tit-${nome}`).innerText = titulosData[nome][tier];
            el.setAttribute('value', val);
            markDirty();
        }

        let currentSkillEditingEl = null;
        let skillModalReturnFocus = null;
        let hasUnsavedChanges = false;

        function clearSkillModalError() {
            const error = document.getElementById('skillModalError');
            const nameInput = document.getElementById('s_nome');
            error.textContent = '';
            error.hidden = true;
            nameInput.removeAttribute('aria-invalid');
        }

        function showSkillModalError(message) {
            const error = document.getElementById('skillModalError');
            const nameInput = document.getElementById('s_nome');
            error.textContent = message;
            error.hidden = false;
            nameInput.setAttribute('aria-invalid', 'true');
            nameInput.focus();
        }

        function markDirty() {
            hasUnsavedChanges = true;
        }
        window.addEventListener('beforeunload', function (e) {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        function openSkillModal(editingEl = null) {
            currentSkillEditingEl = editingEl;
            skillModalReturnFocus = document.activeElement;
            const overlay = document.getElementById('skillModalOverlay');
            const title = document.getElementById('skillModalTitle');
            const nome = document.getElementById('s_nome');
            const tipo = document.getElementById('s_tipo');
            const desc = document.getElementById('s_desc');

            if (editingEl) {
                title.innerText = 'Editar Habilidade';
                nome.value = editingEl.querySelector('.skill-name')?.innerText || '';
                tipo.value = editingEl.querySelector('.skill-type-label')?.innerText || '';
                desc.value = editingEl.querySelector('.desc-info')?.innerText || '';
            } else {
                title.innerText = 'Nova Habilidade';
                nome.value = '';
                tipo.value = '';
                desc.value = '';
            }

            clearSkillModalError();
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            nome.focus();
        }

        function closeSkillModal() {
            const overlay = document.getElementById('skillModalOverlay');
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            clearSkillModalError();
            skillModalReturnFocus?.focus();
            skillModalReturnFocus = null;
        }

        function editSkill(btn) {
            const item = btn.closest('.skill-item');
            openSkillModal(item);
        }

        function addSkill() {
            openSkillModal(null);
        }

        function confirmSkillModal() {
            const n = document.getElementById('s_nome').value.trim();
            const t = document.getElementById('s_tipo').value.trim();
            const d = document.getElementById('s_desc').value.trim();

            if (!n) {
                showSkillModalError('Informe o nome da habilidade.');
                return;
            }
            clearSkillModalError();

            if (currentSkillEditingEl) {
                currentSkillEditingEl.querySelector('.skill-name').innerText = n;
                currentSkillEditingEl.querySelector('.skill-type-label').innerText = t;
                currentSkillEditingEl.querySelector('.desc-tipo').innerText = t;
                currentSkillEditingEl.querySelector('.desc-info').innerText = d;
                updateSkillActionLabels(currentSkillEditingEl, n);
            } else {
                const div = createUiElement('div', { className: 'skill-item' });
                const name = createUiElement('span', { className: 'skill-name', text: n });
                const actions = createUiElement('div', { className: 'skill-actions' });
                const typeLabel = createUiElement('span', { className: 'skill-type-label', text: t });
                const editButton = createActionButton('btn-action btn-edit', '✏️', 'edit-skill');
                const deleteButton = createActionButton('btn-action btn-delete', 'X', 'delete-skill');
                actions.append(typeLabel, editButton, deleteButton);
                const description = createUiElement('div', { className: 'skill-desc' });
                const typeTitle = createUiElement('b', { text: 'Tipo:' });
                const typeValue = createUiElement('span', { className: 'desc-tipo', text: t });
                const descriptionTitle = createUiElement('b', { text: 'Descrição:' });
                const descriptionValue = createUiElement('span', { className: 'desc-info', text: d });
                description.append(typeTitle, document.createTextNode(' '), typeValue,
                    document.createElement('br'), descriptionTitle, document.createTextNode(' '), descriptionValue);
                div.append(name, actions, description);
                updateSkillActionLabels(div, n);
                document.getElementById('skillsContainer').appendChild(div);
            }

            markDirty();
            closeSkillModal();
        }

        function updateSkillActionLabels(item, name) {
            const accessibleName = name.trim() || 'sem nome';
            const editButton = item.querySelector('[data-action="edit-skill"]');
            const deleteButton = item.querySelector('[data-action="delete-skill"]');
            editButton.setAttribute('aria-label', `Editar habilidade ${accessibleName}`);
            editButton.title = 'Editar habilidade';
            deleteButton.setAttribute('aria-label', `Excluir habilidade ${accessibleName}`);
            deleteButton.title = 'Excluir habilidade';
        }
        function addRow() {
            const body = document.getElementById('inventoryBody');
            const row = createUiElement('tr');
            for (let index = 0; index < 3; index++) {
                const cell = createUiElement('td');
                const input = createUiElement('input', { className: 'inv-input', type: 'text', value: '-' });
                cell.appendChild(input);
                row.appendChild(cell);
            }
            body.appendChild(row);
            markDirty();
        }

        function autoGrowTextarea(el) {
            if (!el) return;
            el.style.height = 'auto';
            el.style.height = Math.max(el.scrollHeight, 140) + 'px';
        }

        function init() {
            Object.keys(titulosData).forEach(attr => updateAttr(attr));
            document.getElementById('socialGrid').addEventListener('input', function (e) {
                if (e.target.matches('[data-attribute]')) updateAttr(e.target.dataset.attribute);
            });
            document.getElementById('addSkillBtn').addEventListener('click', addSkill);
            document.getElementById('addInventoryRowBtn').addEventListener('click', addRow);
            document.getElementById('btnSalvar').addEventListener('click', saveFile);
            document.getElementById('skillCancelBtn').addEventListener('click', closeSkillModal);
            document.getElementById('skillSaveBtn').addEventListener('click', confirmSkillModal);

            document.getElementById('skillsContainer').addEventListener('click', function (e) {
                const actionButton = e.target.closest('[data-action]');
                if (!actionButton) return;
                if (actionButton.dataset.action === 'edit-skill') editSkill(actionButton);
                if (actionButton.dataset.action === 'delete-skill') {
                    actionButton.closest('.skill-item').remove();
                    markDirty();
                }
            });

            document.getElementById('skillModalOverlay').addEventListener('click', function (e) {
                if (e.target === this) {
                    // Não fecha ao clicar fora da caixa.
                    e.stopPropagation();
                }
            });

            document.addEventListener('keydown', function (e) {
                const overlay = document.getElementById('skillModalOverlay');
                if (overlay.hidden) return;
                if (e.key === 'Escape') {
                    closeSkillModal();
                    return;
                }
                trapFocusWithin(e, document.querySelector('.skill-modal-box'));
            });

            document.addEventListener('input', function (e) {
                if (e.target.matches('input, textarea')) markDirty();
                if (e.target.id === 's_nome' && e.target.value.trim()) clearSkillModalError();
            });
            document.addEventListener('change', function (e) {
                if (e.target.matches('input, textarea, select')) markDirty();
            });

            const notes = document.querySelector('.notes-area');
            if (notes) {
                autoGrowTextarea(notes);
                notes.addEventListener('input', function () {
                    autoGrowTextarea(notes);
                });
            }

            hasUnsavedChanges = false;
        }

        function saveFile() {
            const nome = sanitizeFilename(document.getElementById('charName').value, 'Ficha_Domador');
            const data = new Date().toLocaleDateString().replace(/\//g, '-');
            downloadCurrentSheet(`DRPG_${nome}_${data}.html`);
            hasUnsavedChanges = false;
        }

        window.addEventListener('load', init);
