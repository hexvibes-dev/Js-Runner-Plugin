(function () {
  if (window.initJsRunnerEnhancements) return;

  let inputSuggestionBox = null;

  function normalizeInputSuggestion(text) {
    const map = {
      'console.log(': 'console.log()',
      'console.error(': 'console.error()',
      'console.warn(': 'console.warn()',
      'function': 'function',
      'const': 'const',
      'let': 'let',
      'var': 'var',
      'return': 'return',
      'if': 'if',
      'else': 'else',
      'for': 'for',
      'while': 'while',
      'async': 'async',
      'await': 'await'
    };
    const key = String(text).toLowerCase();
    return map[key] || key;
  }
  window.normalizeInputSuggestion = normalizeInputSuggestion;

  function triggerInputSuggestions(inputEl) {
    try {
      if (!inputEl) return;
      const keywords = [
        'console.log(',
        'console.error(',
        'console.warn(',
        'function',
        'const',
        'let',
        'var',
        'return',
        'if',
        'else',
        'for',
        'while',
        'async',
        'await'
      ];

      const val = inputEl.value || '';
      const caret = typeof inputEl.selectionStart === 'number' ? inputEl.selectionStart : val.length;
      const prefixMatch = val.slice(0, caret).match(/[A-Za-z$.][A-Za-z0-9$.]*$/);
      const prefix = prefixMatch ? prefixMatch[0] : '';
      const prefixLower = prefix.toLowerCase();
      const matches = prefix
        ? keywords.filter(k => k.toLowerCase().startsWith(prefixLower) && k.toLowerCase() !== prefixLower).slice(0, 8)
        : [];

      if (!matches.length) { hideInputSuggestions(); return; }

      if (!inputSuggestionBox) {
        inputSuggestionBox = document.createElement('div');
        inputSuggestionBox.className = 'js-runner-input-suggestions';
        inputSuggestionBox.style.zIndex = '12000';
        inputSuggestionBox.style.position = 'fixed';
        inputSuggestionBox.style.display = 'none';
        document.body.appendChild(inputSuggestionBox);
        document.addEventListener('click', (e) => {
          if (!inputSuggestionBox) return;
          if (e.target.closest('.js-runner-input-suggestions')) return;
          hideInputSuggestions();
        });
      }

      inputSuggestionBox.innerHTML = '';
      matches.forEach((m, i) => {
        const el = document.createElement('div');
        el.className = 'js-runner-input-suggestion';
        el.textContent = m;
        el.dataset.index = i;
        el.onclick = () => {
          const normalized = normalizeInputSuggestion(m);
          inputEl.value = normalized;
          const p = normalized.indexOf('(');
          if (p !== -1) inputEl.setSelectionRange(p + 1, p + 1);
          inputEl.focus();
          hideInputSuggestions();
        };
        inputSuggestionBox.appendChild(el);
      });

      const rect = inputEl.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY;

      const boxWidth = Math.max(rect.width, 160);
      const viewportW = window.innerWidth + window.scrollX;
      const viewportH = window.innerHeight + window.scrollY;

      if (left + boxWidth > viewportW) left = Math.max(window.scrollX + 8, viewportW - boxWidth - 8);
      if (top + 260 > viewportH) top = Math.max(window.scrollY + 8, rect.top + window.scrollY - 260 - 8);

      inputSuggestionBox.style.left = left + 'px';
      inputSuggestionBox.style.top = top + 'px';
      inputSuggestionBox.style.minWidth = boxWidth + 'px';
      inputSuggestionBox.style.display = 'block';

      window.jsRunner_inputSuggestionBox = inputSuggestionBox;
    } catch (e) {}
  }
  window.triggerInputSuggestions = triggerInputSuggestions;

  function hideInputSuggestions() {
    try {
      if (inputSuggestionBox) inputSuggestionBox.style.display = 'none';
    } catch (e) {}
  }
  window.hideInputSuggestions = hideInputSuggestions;

  function setupInputAutopairing() {}

  function initJsRunnerEnhancements(editorManager) {
    try {
      setupInputAutopairing();
    } catch (e) {}
  }
  window.initJsRunnerEnhancements = initJsRunnerEnhancements;

})();