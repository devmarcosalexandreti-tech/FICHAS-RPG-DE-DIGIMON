
        let currentEditingEl = null;
        let currentModalIsPower = false;
        let modalReturnFocus = null;
        let isCreating = false;
        let hasUnsavedChanges = false;
        let expanded = document.getElementById('checkboxes').style.display === 'block';

        function clearModalError() {
            const error = document.getElementById('modalError');
            const nameInput = document.getElementById('m_nome');
            error.textContent = '';
            error.hidden = true;
            nameInput?.removeAttribute('aria-invalid');
        }

        function showModalError(message) {
            const error = document.getElementById('modalError');
            const nameInput = document.getElementById('m_nome');
            error.textContent = message;
            error.hidden = false;
            nameInput.setAttribute('aria-invalid', 'true');
            nameInput.focus();
        }

        function markDirty() { hasUnsavedChanges = true; }

        function closeModal() {
            const overlay = document.getElementById('modalOverlay');
            overlay.hidden = true;
            overlay.setAttribute('aria-hidden', 'true');
            clearModalError();
            modalReturnFocus?.focus();
            modalReturnFocus = null;
        }

        function addSkill() { isCreating = true; openModalForm(false); }
        function addPower() { isCreating = true; openModalForm(true); }

        function appendModalField(container, labelText, id, tagName = 'input') {
            const label = createUiElement('label', { text: `${labelText}:` });
            label.htmlFor = id;
            const control = createUiElement(tagName, { type: tagName === 'input' ? 'text' : '' });
            control.id = id;
            container.append(label, control);
            return control;
        }

        function openModalForm(isPower) {
            const fields = document.getElementById('modalFields');
            const overlay = document.getElementById('modalOverlay');
            modalReturnFocus = document.activeElement;
            currentModalIsPower = isPower;
            document.getElementById('modalTitle').innerText = isPower ? 'Novo Poder' : 'Nova Habilidade';
            fields.replaceChildren();

            if (isPower) {
                appendModalField(fields, 'Nome', 'm_nome');
                appendModalField(fields, 'Benefício', 'm_ben', 'textarea');
                appendModalField(fields, 'Especial', 'm_esp', 'textarea');
            } else {
                appendModalField(fields, 'Nome', 'm_nome');
                appendModalField(fields, 'Tipo', 'm_tipo');
                const grid = document.createElement('div');
                grid.className = 'grid-modal';
                [
                    ['Alcance', 'm_alc'], ['Alvo', 'm_alv'], ['Duração', 'm_dur'],
                    ['Ação', 'm_aca'], ['Uso', 'm_uso']
                ].forEach(([label, id]) => {
                    const wrapper = createUiElement('div');
                    appendModalField(wrapper, label, id);
                    grid.appendChild(wrapper);
                });
                fields.appendChild(grid);
                appendModalField(fields, 'Descrição', 'm_desc', 'textarea');
                appendModalField(fields, 'Efeito', 'm_efe', 'textarea');
            }

            const nameInput = document.getElementById('m_nome');
            nameInput.required = true;
            nameInput.setAttribute('aria-describedby', 'modalError');
            clearModalError();
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            nameInput.focus();
        }

        function editElement(el, isPower) {
            isCreating = false;
            currentEditingEl = el;
            const nomeEl = el.querySelector('.skill-name');
            const descEl = el.querySelector('.skill-desc');
            const getVal = (field) => descEl.querySelector(`[data-field="${field}"]`)?.textContent || '';

            openModalForm(isPower);
            if (isPower) {
                document.getElementById('modalTitle').innerText = 'Editar Poder';
                document.getElementById('m_nome').value = nomeEl.innerText;
                document.getElementById('m_ben').value = getVal('benefit');
                document.getElementById('m_esp').value = getVal('special');
            } else {
                const tipoEl = el.querySelector('.skill-type-label');
                document.getElementById('m_nome').value = nomeEl.innerText;
                document.getElementById('m_tipo').value = tipoEl.innerText;
                [
                    ['m_alc', 'range'], ['m_alv', 'target'], ['m_dur', 'duration'],
                    ['m_aca', 'action'], ['m_uso', 'use'], ['m_desc', 'description'], ['m_efe', 'effect']
                ].forEach(([id, field]) => { document.getElementById(id).value = getVal(field); });
            }
        }

        function appendDescriptionField(container, label, field, value, addBreak = false) {
            const strong = createUiElement('b', { text: `${label}:` });
            const fieldValue = createUiElement('span', { className: 'skill-field-value', text: value });
            fieldValue.dataset.field = field;
            container.append(strong, document.createTextNode(' '), fieldValue, document.createTextNode(' '));
            if (addBreak) container.appendChild(document.createElement('br'));
        }

        function renderDescription(container, isPower, values) {
            container.replaceChildren();
            if (isPower) {
                appendDescriptionField(container, 'Benefício', 'benefit', values.benefit, true);
                appendDescriptionField(container, 'Especial', 'special', values.special);
                return;
            }

            appendDescriptionField(container, 'Alcance', 'range', values.range);
            appendDescriptionField(container, 'Alvo', 'target', values.target);
            appendDescriptionField(container, 'Duração', 'duration', values.duration);
            appendDescriptionField(container, 'Ação', 'action', values.action);
            appendDescriptionField(container, 'Uso', 'use', values.use, true);
            appendDescriptionField(container, 'Descrição', 'description', values.description, true);
            appendDescriptionField(container, 'Efeito', 'effect', values.effect);
        }

        function createSkillItem(isPower, values) {
            const item = createUiElement('div', { className: 'skill-item' });
            const name = createUiElement('span', { className: 'skill-name', text: values.name });
            const actions = createUiElement('div', { className: 'skill-actions' });

            if (!isPower) {
                const type = createUiElement('span', { className: 'skill-type-label', text: values.type });
                actions.appendChild(type);
            }

            const editButton = createActionButton('btn-edit', '✏️', 'edit-skill', { isPower: String(isPower) });
            const deleteButton = createActionButton('btn-delete', 'X', 'delete-skill');
            actions.append(editButton, deleteButton);
            const description = createUiElement('div', { className: 'skill-desc' });
            renderDescription(description, isPower, values);
            item.append(name, actions, description);
            updateSkillActionLabels(item, isPower, values.name);
            return item;
        }

        function updateSkillActionLabels(item, isPower, name) {
            const itemType = isPower ? 'poder' : 'habilidade';
            const accessibleName = name.trim() || 'sem nome';
            const editButton = item.querySelector('[data-action="edit-skill"]');
            const deleteButton = item.querySelector('[data-action="delete-skill"]');
            editButton.setAttribute('aria-label', `Editar ${itemType} ${accessibleName}`);
            editButton.title = `Editar ${itemType}`;
            deleteButton.setAttribute('aria-label', `Excluir ${itemType} ${accessibleName}`);
            deleteButton.title = `Excluir ${itemType}`;
        }

        function saveFromModal(isPower) {
            const v = (id) => document.getElementById(id).value;
            const nameInput = document.getElementById('m_nome');
            if (!nameInput.value.trim()) {
                showModalError(isPower ? 'Informe o nome do poder.' : 'Informe o nome da habilidade.');
                return;
            }
            clearModalError();
            const values = isPower ? {
                name: v('m_nome').trim(), benefit: v('m_ben'), special: v('m_esp')
            } : {
                name: v('m_nome').trim(), type: v('m_tipo'), range: v('m_alc'), target: v('m_alv'),
                duration: v('m_dur'), action: v('m_aca'), use: v('m_uso'),
                description: v('m_desc'), effect: v('m_efe')
            };

            if (isCreating) {
                const container = isPower ? document.getElementById('powersContainer') : document.getElementById('skillsContainer');
                container.appendChild(createSkillItem(isPower, values));
            } else {
                const nomeEl = currentEditingEl.querySelector('.skill-name');
                if (nomeEl) nomeEl.textContent = values.name;

                const desc = currentEditingEl.querySelector('.skill-desc');
                if (!isPower) {
                    const tipoEl = currentEditingEl.querySelector('.skill-type-label');
                    if (tipoEl) tipoEl.textContent = values.type;
                }
                if (desc) renderDescription(desc, isPower, values);
                updateSkillActionLabels(currentEditingEl, isPower, values.name);
            }

            markDirty();
            closeModal();
        }

        document.getElementById('modalOverlay').addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            const overlay = document.getElementById('modalOverlay');
            if (overlay.hidden) return;
            if (e.key === 'Escape') {
                closeModal();
                return;
            }
            trapFocusWithin(e, overlay.querySelector('.modal-box'));
        });

        document.getElementById('modalFields').addEventListener('input', function (e) {
            if (e.target.id === 'm_nome' && e.target.value.trim()) clearModalError();
        });

        function addInventoryRow() {
            const tr = createUiElement('tr', { className: 'inventory-row' });
            for (let index = 0; index < 3; index++) {
                const cell = createUiElement('td', { className: 'inventory-cell' });
                const input = createUiElement('input', {
                    className: `inventory-input${index === 2 ? ' inventory-input-wide' : ''}`,
                    type: 'text'
                });
                cell.appendChild(input);
                tr.appendChild(cell);
            }
            document.getElementById('inventoryBody').appendChild(tr);
            markDirty();
        }

        function saveFile() {
            const nome = sanitizeFilename(document.getElementById('charName').value, 'Ficha_Digimon');
            const data = new Date().toLocaleDateString().replace(/\//g, '-');
            downloadCurrentSheet(`DRPG_${nome}_${data}.html`);
            hasUnsavedChanges = false;
        }

        function showCheckboxes() {
            var checkboxes = document.getElementById('checkboxes');
            const trigger = document.getElementById('conditionSelectTrigger');
            if (!expanded) {
                checkboxes.style.display = 'block';
                expanded = true;
            } else {
                checkboxes.style.display = 'none';
                expanded = false;
            }
            trigger.setAttribute('aria-expanded', String(expanded));
        }

        function updateSelected() {
            const checkboxes = document.querySelectorAll('#checkboxes input[type=checkbox]:checked');
            const display = document.getElementById('displayValue');
            let selected = Array.from(checkboxes).map(cb => cb.value);

            if (selected.length > 0) {
                display.innerText = selected.join(', ');
            } else {
                display.innerText = 'Selecionar Condições...';
            }
            markDirty();
        }

        document.addEventListener('input', function (e) {
            if (e.target.matches('input, textarea')) {
                markDirty();
            }
        });

        document.addEventListener('change', function (e) {
            if (e.target.matches('input, textarea, select')) {
                markDirty();
            }
        });

        document.getElementById('conditionSelectTrigger').addEventListener('click', showCheckboxes);
        document.getElementById('checkboxes').addEventListener('change', function (e) {
            if (e.target.matches('input[type="checkbox"]')) updateSelected();
        });
        document.getElementById('addInventoryRowBtn').addEventListener('click', addInventoryRow);
        document.getElementById('addSkillBtn').addEventListener('click', addSkill);
        document.getElementById('addPowerBtn').addEventListener('click', addPower);
        document.getElementById('btnSalvar').addEventListener('click', saveFile);
        document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
        document.getElementById('saveModalBtn').addEventListener('click', function () {
            saveFromModal(currentModalIsPower);
        });

        window.addEventListener('beforeunload', function (e) {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        document.addEventListener('click', function (e) {
            const actionButton = e.target.closest('[data-action]');
            if (actionButton?.dataset.action === 'edit-skill') {
                editElement(actionButton.closest('.skill-item'), actionButton.dataset.isPower === 'true');
                return;
            }
            if (actionButton?.dataset.action === 'delete-skill') {
                actionButton.closest('.skill-item').remove();
                markDirty();
                return;
            }

            const menu = document.querySelector('.multiselect');
            if (!menu.contains(e.target)) {
                document.getElementById('checkboxes').style.display = 'none';
                expanded = false;
                document.getElementById('conditionSelectTrigger').setAttribute('aria-expanded', 'false');
            }
        });
