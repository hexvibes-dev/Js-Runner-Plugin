// enhancements.js
(function () {
  if (window.initJsRunnerEnhancements) return;

  let editorSuggestionBox = null;
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
    const key = text.toLowerCase();
    return map[key] || text.toLowerCase();
  }
  window.normalizeInputSuggestion = normalizeInputSuggestion;

  function triggerInputSuggestions(inputEl) {
    try {
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
      const val = inputEl.value;
      const caret = inputEl.selectionStart;
      const prefixMatch = val.slice(0, caret).match(/[A-Za-z_$.][A-Za-z0-9_$.]*$/);
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
      }
      inputSuggestionBox.innerHTML = '';
      matches.forEach((m) => {
        const el = document.createElement('div');
        el.className = 'js-runner-input-suggestion';
        el.textContent = m;
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
      window.__jsRunner_inputSuggestionBox = inputSuggestionBox;
      window.jsRunner_inputSuggestionBox = inputSuggestionBox;
    } catch (e) {}
  }
  window.triggerInputSuggestions = triggerInputSuggestions;

  function hideInputSuggestions() {
    if (inputSuggestionBox) inputSuggestionBox.style.display = 'none';
  }
  window.hideInputSuggestions = hideInputSuggestions;

  function setupEditorEnhancements(editorManager) {
    try {
      const editor = editorManager && editorManager.editor;
      if (!editor) return;

      const keywords = [
        'function','const','let','var','console.log(','console.error(','console.warn(','return','if','else','for','while',
        'async','await','=>','class','new','try','catch','finally','switch','case','break','continue','import','from','export','default','typeof','instanceof',
        'document','window','setTimeout','setInterval','Promise','Array','Object','Map'
      ];
      const canonical = {};
      keywords.forEach(k => canonical[k.toLowerCase()] = k);

      if (!editorSuggestionBox) {
        editorSuggestionBox = document.createElement('div');
        editorSuggestionBox.className = 'js-runner-suggestions';
        editorSuggestionBox.style.display = 'none';
        editorSuggestionBox.style.zIndex = '12000';
        document.body.appendChild(editorSuggestionBox);
      }

      const showEditorSuggestions = function(list, coords) {
        editorSuggestionBox.innerHTML = '';
        list.forEach((item, idx) => {
          const el = document.createElement('div');
          el.className = 'js-runner-suggestion';
          el.textContent = canonical[item.toLowerCase()] || item.toLowerCase();
          el.dataset.index = idx;
          el.onclick = () => applyEditorSuggestion(canonical[item.toLowerCase()] || item.toLowerCase());
          editorSuggestionBox.appendChild(el);
        });

        const left = (coords && (coords.pageX !== undefined ? coords.pageX : coords.x)) || 0;
        const top = (coords && (coords.pageY !== undefined ? coords.pageY : coords.y)) || 0;
        editorSuggestionBox.style.left = (left + window.scrollX) + 'px';
        editorSuggestionBox.style.top = (top + 20 + window.scrollY) + 'px';
        editorSuggestionBox.style.display = list.length ? 'block' : 'none';
      };

      const hideEditorSuggestions = function() { if (editorSuggestionBox) editorSuggestionBox.style.display = 'none'; };

      const applyEditorSuggestion = function(text) {
        const pos = editor.getCursorPosition();
        const line = editor.session.getLine(pos.row);
        const prefixMatch = line.slice(0, pos.column).match(/[A-Za-z_$][A-Za-z0-9_$]*$/);
        const prefix = prefixMatch ? prefixMatch[0] : '';
        const startCol = pos.column - prefix.length;

        let insertText = text;
        if (text.endsWith('(')) insertText = text + ')';

        editor.session.replace({ start: { row: pos.row, column: startCol }, end: pos }, insertText);

        if (insertText.indexOf('(') !== -1) {
          const newCol = startCol + insertText.indexOf('(') + 1;
          editor.moveCursorTo(pos.row, newCol);
        } else {
          const newCol = startCol + insertText.length;
          editor.moveCursorTo(pos.row, newCol);
        }
        editor.focus();
        hideEditorSuggestions();
      };

      const computeAndShowSuggestions = function() {
        try {
          const pos = editor.getCursorPosition();
          const line = editor.session.getLine(pos.row);
          const prefixMatch = line.slice(0, pos.column).match(/[A-Za-z_$][A-Za-z0-9_$]*$/);
          const prefix = prefixMatch ? prefixMatch[0] : '';
          if (!prefix) { hideEditorSuggestions(); return; }
          const prefixLower = prefix.toLowerCase();
          const matches = Object.keys(canonical).filter(k => k.startsWith(prefixLower) && k !== prefixLower).slice(0, 12);
          if (!matches.length) { hideEditorSuggestions(); return; }
          const coords = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
          const pageX = (coords && coords.pageX !== undefined) ? coords.pageX : (coords && coords.x !== undefined ? coords.x : 0);
          const pageY = (coords && coords.pageY !== undefined) ? coords.pageY : (coords && coords.y !== undefined ? coords.y : 0);
          showEditorSuggestions(matches, { pageX, pageY });
        } catch (err) {
          // silent
        }
      };

      editor.on('change', function(delta) {
        try {
          if (delta.action === 'insert' && delta.lines && delta.lines.length === 1 && delta.lines[0].length === 1) {
            const ch = delta.lines[0];
            const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '`': '`' };
            if (pairs[ch]) {
              const pos = editor.getCursorPosition();
              editor.session.insert(pos, pairs[ch]);
              editor.moveCursorTo(pos.row, pos.column);
            }
          }
        } catch (err) {}
        computeAndShowSuggestions();
      });

      const textInput = (editor.textInput && editor.textInput.getElement && editor.textInput.getElement()) || editor.container;
      if (textInput) {
        const debounced = debounce(() => computeAndShowSuggestions(), 60);
        textInput.addEventListener('input', debounced);
        textInput.addEventListener('keyup', debounced);

        textInput.addEventListener('keydown', (e) => {
          if (editorSuggestionBox && editorSuggestionBox.style.display === 'block') {
            if (['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key)) {
              e.preventDefault();
              const items = Array.from(editorSuggestionBox.querySelectorAll('.js-runner-suggestion'));
              if (!items.length) return;
              let active = editorSuggestionBox.querySelector('.js-runner-suggestion.active');
              let idx = active ? items.indexOf(active) : -1;
              if (e.key === 'ArrowDown') idx = idx < items.length - 1 ? idx + 1 : 0;
              else if (e.key === 'ArrowUp') idx = idx > 0 ? idx - 1 : items.length - 1;
              else if (e.key === 'Enter') { if (idx === -1) idx = 0; applyEditorSuggestion(items[idx].textContent); return; }
              else if (e.key === 'Escape') { hideEditorSuggestions(); return; }
              items.forEach(it => it.classList.remove('active'));
              items[idx].classList.add('active');
              return;
            }
          }

          const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '`': '`' };
          if (e.key in pairs && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const selRange = editor.getSelectionRange();
            if (selRange && (selRange.start.row !== selRange.end.row || selRange.start.column !== selRange.end.column)) {
              e.preventDefault();
              const selectedText = editor.session.getTextRange(selRange);
              const open = e.key;
              const close = pairs[e.key];
              editor.session.replace(selRange, open + selectedText + close);
              editor.selection.setSelectionRange({
                start: { row: selRange.start.row, column: selRange.start.column + 1 },
                end: { row: selRange.end.row, column: selRange.end.column + 1 }
              });
            }
          }
        });
      }

      editor.container.addEventListener('blur', () => hideEditorSuggestions(), true);
      document.addEventListener('click', (e) => {
        if (!editorSuggestionBox) return;
        if (e.target.closest('.js-runner-suggestions')) return;
        if (e.target.closest('.ace_editor')) return;
        hideEditorSuggestions();
      });

      window.__jsRunner_editorSuggestionBox = editorSuggestionBox;
    } catch (err) {
      console.warn('Editor enhancements not available:', err && err.message);
    }
  }

  function debounce(fn, wait) {
    let t = null;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), wait);
    };
  }

  function initJsRunnerEnhancements(editorManager) {
    try { setupEditorEnhancements(editorManager); } catch (e) {}
  }

  window.initJsRunnerEnhancements = initJsRunnerEnhancements;
})();