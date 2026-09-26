        function createUiElement(tagName, options = {}) {
            const element = document.createElement(tagName);
            if (options.className) element.className = options.className;
            if (options.text !== undefined) element.textContent = options.text;
            if (options.type) element.type = options.type;
            if (options.value !== undefined) element.value = options.value;
            if (options.dataset) Object.assign(element.dataset, options.dataset);
            return element;
        }

        function createActionButton(className, text, action, dataset = {}) {
            return createUiElement('button', {
                className,
                text,
                type: 'button',
                dataset: { action, ...dataset }
            });
        }

        function trapFocusWithin(event, modal) {
            if (event.key !== 'Tab') return;
            const focusable = Array.from(modal.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled])'));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        function copyFormState(source, target) {
            const sourceFields = source.querySelectorAll('input, textarea, select');
            const targetFields = target.querySelectorAll('input, textarea, select');

            sourceFields.forEach((field, index) => {
                const targetField = targetFields[index];
                if (field.matches('textarea')) {
                    targetField.textContent = field.value;
                    return;
                }
                if (field.matches('select')) {
                    Array.from(field.options).forEach((option, optionIndex) => {
                        targetField.options[optionIndex].toggleAttribute('selected', option.selected);
                    });
                    return;
                }

                targetField.setAttribute('value', field.value);
                if (field.matches('[type="checkbox"], [type="radio"]')) {
                    targetField.toggleAttribute('checked', field.checked);
                }
            });
        }

        function serializeCurrentSheet() {
            const documentClone = document.documentElement.cloneNode(true);
            copyFormState(document, documentClone);
            return '<!DOCTYPE html>\n' + documentClone.outerHTML;
        }

        function sanitizeFilename(value, fallback) {
            const sanitized = String(value || '')
                .trim()
                .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
                .replace(/\s+/g, '_')
                .replace(/[. ]+$/g, '')
                .slice(0, 80);
            return sanitized || fallback;
        }

        function downloadCurrentSheet(filename) {
            let link;
            let url;

            try {
                const blob = new Blob([serializeCurrentSheet()], { type: 'text/html;charset=utf-8' });
                url = URL.createObjectURL(blob);
                link = createUiElement('a');
                link.href = url;
                link.download = filename;
                link.hidden = true;
                document.body.appendChild(link);
                link.click();
            } finally {
                link?.remove();
                if (url) setTimeout(() => URL.revokeObjectURL(url), 0);
            }
        }

        function requestCurrentSheetDownload(filename) {
            try {
                downloadCurrentSheet(filename);
                return true;
            } catch {
                window.alert('Não foi possível iniciar o download. Verifique as permissões do navegador e tente novamente.');
                return false;
            }
        }
