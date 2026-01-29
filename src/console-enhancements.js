(function () {
  if (window.formatForConsole) return;

  window.formatForConsole = function (value, space = 2) {
    const seen = new WeakSet();

    function replacer(key, val) {

      if (val instanceof Map) {
        try {
          return { __type: 'Map', size: val.size, entries: Array.from(val.entries()) };
        } catch (e) {
          return { __type: 'Map', size: val.size };
        }
      }

      if (val instanceof Set) {
        try {
          return { __type: 'Set', size: val.size, values: Array.from(val.values()) };
        } catch (e) {
          return { __type: 'Set', size: val.size };
        }
      }

      try {
        if (ArrayBuffer.isView(val) && !(val instanceof DataView)) {
          return Array.from(val);
        }
      } catch (e) {}

      if (val instanceof Date) {
        return { __type: 'Date', value: val.toISOString() };
      }

      if (val instanceof RegExp) {
        return { __type: 'RegExp', value: val.toString() };
      }

      if (typeof val === 'function') {
        return { __type: 'Function', name: val.name || '<anonymous>' };
      }

      if (val && typeof val === 'object') {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }

      return val;
    }

    try {
      return JSON.stringify(value, replacer, space);
    } catch (e) {
      try {
        return JSON.stringify(value, replacer);
      } catch (e2) {
        try {
          return String(value);
        } catch (e3) {
          return '[Unserializable]';
        }
      }
    }
  };

  window.prettyConsoleFormat = function (obj) {
    try {
      const s = window.formatForConsole(obj, 2);
      return String(s)
        .replace(/"__type":\s*"Map",\s*"size":\s*(\d+),\s*"entries":\s*\[/g, 'Map($1) [')
        .replace(/"__type":\s*"Set",\s*"size":\s*(\d+),\s*"values":\s*\[/g, 'Set($1) [')
        .replace(/"__type":\s*"Date",\s*"value":\s*"([^"]+)"/g, 'Date("$1")')
        .replace(/"__type":\s*"RegExp",\s*"value":\s*"([^"]+)"/g, 'RegExp("$1")')
        .replace(/"__type":\s*"Function",\s*"name":\s*"([^"]+)"/g, 'Function($1)');
    } catch (e) {
      try { return String(obj); } catch (e2) { return '[Unserializable]'; }
    }
  };
})();