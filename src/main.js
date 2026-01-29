// main.js
window.acode.setPluginInit("js-runner", (baseUrl, $page, cache) => {
  const editorManager = window.editorManager;
  let btn = null;
  let modal = null;

  /* ===========================
     Styles (external: style.css)
     =========================== */
  (function injectStyles() {
    const link = document.createElement('link');
    link.id = 'js-runner-styles';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = (typeof baseUrl === 'string' ? baseUrl : '') + 'style.css';
    document.head.appendChild(link);
  })();

  /* ===========================
     Console hooking and output
     =========================== */
  function appendOutput(text, cls) {
    if (!modal) openConsole();
    const out = modal.querySelector('#js-runner-output');
    const line = document.createElement('div');
    line.className = 'js-runner-output-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function clearOutput() {
    if (!modal) return;
    const out = modal.querySelector('#js-runner-output');
    out.innerHTML = '';
  }

  function hookConsole() {
    if (window.origConsole) return;
    window.origConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
    };
    console.log = function(...args) {
      try { window.origConsole.log.apply(window.origConsole, args); } catch (e) {}
      appendOutput(
        args.map(a =>
          (typeof a === 'object' && a !== null
            ? (typeof window.prettyConsoleFormat === 'function' ? window.prettyConsoleFormat(a) : JSON.stringify(a))
            : String(a))
        ).join(' ')
      );
    };
    console.error = function(...args) {
      try { window.origConsole.error.apply(window.origConsole, args); } catch (e) {}
      appendOutput(
        args.map(a =>
          (typeof a === 'object' && a !== null
            ? (typeof window.prettyConsoleFormat === 'function' ? window.prettyConsoleFormat(a) : JSON.stringify(a))
            : String(a))
        ).join(' '),
        'err'
      );
    };
    console.warn = function(...args) {
      try { window.origConsole.warn.apply(window.origConsole, args); } catch (e) {}
      appendOutput(
        args.map(a =>
          (typeof a === 'object' && a !== null
            ? (typeof window.prettyConsoleFormat === 'function' ? window.prettyConsoleFormat(a) : JSON.stringify(a))
            : String(a))
        ).join(' '),
        'warn'
      );
    };
  }

  function unhookConsole() {
    if (!window.origConsole) return;
    try {
      console.log = window.origConsole.log;
      console.error = window.origConsole.error;
      console.warn = window.origConsole.warn;
    } catch (e) {}
    window.origConsole = null;
  }

  /* ===========================
     Button + modal creation
     =========================== */
  function createButton() {
    if (btn) return;
    btn = document.createElement('div');
    btn.id = 'js-runner-btn';
    btn.innerText = 'JS';
    document.body.appendChild(btn);

    // Use Pointer events for consistent drag/click behavior across mouse/touch
    let startX = 0, startY = 0;
    let offsetX = 0, offsetY = 0;
    let moved = false;
    const MOVE_THRESHOLD = 6;
    let pointerId = null;

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      try { btn.setPointerCapture(pointerId); } catch (err) {}
      startX = e.clientX;
      startY = e.clientY;
      const rect = btn.getBoundingClientRect();
      offsetX = startX - rect.left;
      offsetY = startY - rect.top;
      moved = false;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerCancel);
    }

    function onPointerMove(e) {
      if (e.pointerId !== pointerId) return;
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) moved = true;
      btn.style.position = 'fixed';
      btn.style.left = (e.clientX - offsetX) + 'px';
      btn.style.top = (e.clientY - offsetY) + 'px';
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    }

    function onPointerUp(e) {
      if (e.pointerId !== pointerId) return;
      try { btn.releasePointerCapture(pointerId); } catch (err) {}
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerCancel);
      const wasMoved = moved;
      setTimeout(() => { moved = false; }, 50);
      if (!wasMoved) openConsole();
      pointerId = null;
    }

    function onPointerCancel(e) {
      if (e.pointerId !== pointerId) return;
      try { btn.releasePointerCapture(pointerId); } catch (err) {}
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerCancel);
      pointerId = null;
      moved = false;
    }

    btn.addEventListener('pointerdown', onPointerDown, { passive: true });

    // keyboard activation
    btn.tabIndex = 0;
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openConsole(); });
  }

  function removeButton() {
    if (!btn) return;
    btn.remove();
    btn = null;
  }

  function openConsole() {
    if (modal) return;
    modal = document.createElement('div');
    modal.id = 'js-runner-modal';
    modal.className = 'js-runner-modal';
    modal.innerHTML = `
      <div class="js-runner-header" id="js-runner-header">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="js-runner-accent"> <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" height="1.5em" width="1.5em"><path fill="currentColor" d="M32.95 34.95q-.45.45-1.05.425-.6-.025-1.05-.475-.45-.45-.45-1.075t.45-1.075l8.85-8.85-8.8-8.8q-.45-.45-.425-1.075.025-.625.475-1.075.45-.45 1.075-.45t1.075.45l9.85 9.9q.45.45.45 1.05 0 .6-.45 1.05Zm-18-.15-9.9-9.85q-.45-.45-.45-1.05 0-.6.45-1.05l10-10q.45-.45 1.075-.45t1.075.45q.45.45.45 1.075T17.2 15l-8.9 8.9 8.8 8.8q.45.45.45 1.05 0 .6-.45 1.05-.45.45-1.075.45t-1.075-.45Z"/></svg> </span>
          <span style="opacity:.85;font-size:13px">Console</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button id="js-runner-clear" class="js-runner-clear">Limpiar</button>
          <button id="js-runner-close" class="js-runner-small">Cerrar</button>
        </div>
      </div>
      <div id="js-runner-output"></div>
      <div class="js-runner-input-area">
        <input id="js-runner-input" class="js-runner-input" placeholder=". .  ." />
        <button id="js-runner-run" class="js-runner-run" type="button">Run</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Attach handlers using addEventListener and stopPropagation on the run button
    const clearBtn = modal.querySelector('#js-runner-clear');
    const closeBtn = modal.querySelector('#js-runner-close');
    const runBtn = modal.querySelector('#js-runner-run');

    clearBtn.addEventListener('click', (e) => { e.stopPropagation(); clearOutput(); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeConsole(); });

    // Run button: behave exactly like the keyboard "arrow/enter" action (runExpression)
    runBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        const input = modal.querySelector('#js-runner-input');
        if (!input) return;
        const val = input.value.trim();
        if (val) {
          if (!window.origConsole) hookConsole();
          runExpression(val);
          input.value = '';
          if (window.hideInputSuggestions) window.hideInputSuggestions();
        } else {
          // si prefieres que ejecute el archivo cuando el input está vacío, descomenta la siguiente línea:
          // runFile();
        }
      } catch (err) {
        try { console.error(err && err.stack ? err.stack : String(err)); } catch (e) {}
      }
    });

    const input = modal.querySelector('#js-runner-input');

    // input handlers: autopair + suggestions (compatible with enhancements.js)
    input.addEventListener('keydown', inputKeyDownHandler);
    input.addEventListener('beforeinput', inputBeforeInputHandler);
    let lastValue = input.value;
    input.addEventListener('input', () => {
      if (window.triggerInputSuggestions) window.triggerInputSuggestions(input);
      try {
        const val = input.value;
        const diff = val.length - lastValue.length;
        if (diff > 0) {
          const inserted = val.slice(input.selectionStart - diff, input.selectionStart);
          const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '': '' };
          if (inserted && inserted.length === 1 && pairs[inserted]) {
            const start = input.selectionStart;
            if (val[start] !== pairs[inserted]) {
              input.value = val.slice(0, start) + pairs[inserted] + val.slice(start);
              input.setSelectionRange(start, start);
            }
          }
        }
      } catch (err) {}
      lastValue = input.value;
    });

    input.addEventListener('blur', () => setTimeout(() => { if (window.hideInputSuggestions) window.hideInputSuggestions(); }, 150));

    // ensure console hooked
    hookConsole();

    // make modal draggable by header
    const header = modal.querySelector('#js-runner-header');
    makeElementDraggable(modal, header);

    // load enhancements.js if present and initialize editor enhancements
    // call init after a short delay to ensure editor is ready and suggestions DOM can attach
    loadEnhancementsScript(() => {
      setTimeout(() => {
        if (window.initJsRunnerEnhancements) {
          try { window.initJsRunnerEnhancements(editorManager); } catch (e) {}
        }
        // Ejecutar automáticamente el archivo activo al abrir la consola
        try { if (typeof runActiveFile === 'function') runActiveFile(); } catch (e) {}
      }, 80);
    });
  }

  function closeConsole() {
    if (!modal) return;
    unhookConsole();
    modal.remove();
    modal = null;
  }

  /* ===========================
     Execution helpers
     =========================== */
  function runFile() {
    try {
      const editor = editorManager && editorManager.editor;
      let code = '';
      if (editor) {
        if (typeof editor.getValue === 'function') {
          code = String(editor.getValue());
        } else if (editor.session && typeof editor.session.getValue === 'function') {
          code = String(editor.session.getValue());
        }
      }

      if (!code || !code.trim()) {
        appendOutput('No hay código en el editor para ejecutar.', 'warn');
        return;
      }

      // ensure console hooked and modal open before executing
      if (!modal) openConsole();
      if (!window.origConsole) hookConsole();

      try {
        // Ejecutar y dejar que las llamadas a console.* sean capturadas por hookConsole
        new Function(code)();
      } catch (execErr) {
        // Mostrar error en la consola del modal
        console.error(execErr && execErr.stack ? execErr.stack : String(execErr));
      }
    } catch (e) {
      try { console.error(e && e.stack ? e.stack : String(e)); } catch (err) {}
    }
  }

  // --- INCORPORACIÓN: runActiveFile (desde run.js) ---
  function runActiveFile() {
    try {
      const editorManagerLocal = window.editorManager;
      const editor = editorManagerLocal && editorManagerLocal.editor;
      if (!editor) return;

      let code = '';
      if (typeof editor.getValue === 'function') {
        code = String(editor.getValue());
      } else if (editor.session && typeof editor.session.getValue === 'function') {
        code = String(editor.session.getValue());
      }

      if (!code.trim()) {
        console.warn('No hay código en el editor para ejecutar.');
        return;
      }

      // Enganchar consola antes de ejecutar
      if (!window.origConsole && typeof hookConsole === 'function') {
        hookConsole();
      }

      new Function(code)();
    } catch (e) {
      console.error(e && e.stack ? e.stack : String(e));
    }
  }
  // --- FIN INCORPORACIÓN ---

  function runExpression(expr) {
    try {
      if (!modal) openConsole();
      if (!window.origConsole) hookConsole();
      try {
        const res = new Function('"use strict"; return (' + expr + ')')();
        if (typeof res !== 'undefined') {
          // Use prettyConsoleFormat for objects if available
          if (typeof res === 'object' && res !== null) {
            appendOutput(typeof window.prettyConsoleFormat === 'function' ? window.prettyConsoleFormat(res) : JSON.stringify(res));
          } else {
            appendOutput(String(res));
          }
        }
      } catch (inner) {
        try {
          new Function(expr)();
        } catch (e) {
          console.error(e && e.stack ? e.stack : String(e));
        }
      }
    } catch (e) {
      console.error(e && e.stack ? e.stack : String(e));
    }
  }

  /* ===========================
     Input handlers (autopair + suggestions navigation)
     =========================== */
  function inputBeforeInputHandler(e) {
    try {
      const inputEl = e.target;
      const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '': '' };
      if (e.inputType === 'insertText' && e.data && pairs[e.data] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd;
        const open = e.data;
        const close = pairs[open];
        if (start !== end) {
          const sel = inputEl.value.slice(start, end);
          inputEl.value = inputEl.value.slice(0, start) + open + sel + close + inputEl.value.slice(end);
          inputEl.setSelectionRange(start + 1, end + 1);
        } else {
          inputEl.value = inputEl.value.slice(0, start) + open + close + inputEl.value.slice(start);
          inputEl.setSelectionRange(start + 1, start + 1);
        }
        if (window.triggerInputSuggestions) window.triggerInputSuggestions(inputEl);
      }
    } catch (err) {}
  }

  function inputKeyDownHandler(e) {
    const inputEl = e.target;
    const box = window.jsRunner_inputSuggestionBox;
    if (box && box.style.display === 'block') {
      const items = Array.from(box.querySelectorAll('.js-runner-input-suggestion'));
      const active = box.querySelector('.active');
      let idx = active ? items.indexOf(active) : -1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = idx < items.length - 1 ? idx + 1 : 0;
        items.forEach(it => it.classList.remove('active'));
        items[idx].classList.add('active');
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = idx > 0 ? idx - 1 : items.length - 1;
        items.forEach(it => it.classList.remove('active'));
        items[idx].classList.add('active');
        return;
      } else if (e.key === 'Enter') {
        const chosen = (idx === -1) ? items[0] : items[idx];
        if (chosen) {
          e.preventDefault();
          const normalized = (window.normalizeInputSuggestion) ? window.normalizeInputSuggestion(chosen.textContent) : chosen.textContent.toLowerCase();
          inputEl.value = normalized;
          setCaretInsideParens(inputEl);
          if (window.hideInputSuggestions) window.hideInputSuggestions();
          return;
        }
      } else if (e.key === 'Escape') {
        if (window.hideInputSuggestions) window.hideInputSuggestions();
        return;
      }
    }

    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '': '' };
    if (e.key in pairs && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const open = e.key;
      const close = pairs[open];
      if (start !== end) {
        const sel = inputEl.value.slice(start, end);
        inputEl.value = inputEl.value.slice(0, start) + open + sel + close + inputEl.value.slice(end);
        inputEl.setSelectionRange(start + 1, end + 1);
      } else {
        inputEl.value = inputEl.value.slice(0, start) + open + close + inputEl.value.slice(start);
        inputEl.setSelectionRange(start + 1, start + 1);
      }
      if (window.triggerInputSuggestions) window.triggerInputSuggestions(inputEl);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputEl.value.trim();
      if (val) {
        runExpression(val);
        inputEl.value = '';
        if (window.hideInputSuggestions) window.hideInputSuggestions();
      }
    }
  }

  function setCaretInsideParens(inputEl) {
    try {
      const v = inputEl.value;
      const caret = inputEl.selectionStart;
      let idx = v.lastIndexOf('(', caret);
      if (idx === -1) idx = v.indexOf('(');
      if (idx !== -1) {
        inputEl.setSelectionRange(idx + 1, idx + 1);
        inputEl.focus();
      }
    } catch (e) {}
  }

  /* ===========================
     Helpers
     =========================== */
  function makeElementDraggable(el, handle) {
    if (!el || !handle) return;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;
    handle.style.cursor = 'move';
    handle.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      function move(ev) {
        el.style.left = (origLeft + (ev.clientX - startX)) + 'px';
        el.style.top = (origTop + (ev.clientY - startY)) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.position = 'fixed';
      }
      function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    // touch support
    handle.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      const rect = el.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      function move(ev) {
        if (!ev.touches || !ev.touches[0]) return;
        const tt = ev.touches[0];
        el.style.left = (origLeft + (tt.clientX - startX)) + 'px';
        el.style.top = (origTop + (tt.clientY - startY)) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.position = 'fixed';
      }
      function up() {
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', up);
      }
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', up);
    }, { passive: true });
  }

  function loadEnhancementsScript(cb) {
    const url = (typeof baseUrl === 'string' ? baseUrl : '') + 'enhancements.js';
    if (window.initJsRunnerEnhancements) { try { cb(); } catch (e) { cb(); } return; }
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => cb();
    s.onerror = () => cb();
    document.head.appendChild(s);
  }

  function isJsFile() {
    const file = editorManager.activeFile;
    return file && file.filename && file.filename.endsWith('.js');
  }

  /* Init wiring */
  try {
    if (editorManager && editorManager.editor) {
      if (window.initJsRunnerEnhancements) window.initJsRunnerEnhancements(editorManager);
    }
    editorManager.on('switch-file', () => {
      setTimeout(() => {
        if (window.initJsRunnerEnhancements) window.initJsRunnerEnhancements(editorManager);
      }, 120);
    });
  } catch (e) {}

  editorManager.on('switch-file', () => {
    if (isJsFile()) createButton();
    else removeButton();
  });

  try { if (isJsFile()) createButton(); } catch (e) {}
});