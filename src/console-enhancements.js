(function () {
  if (window.prettyConsoleFormat) return;

  window.prettyConsoleFormat = function (obj) {
    try {
      return window.utilInspect ? window.utilInspect(obj) : String(obj);
    } catch (e) {
      try { return String(obj); } catch (e2) { return '[Unserializable]'; }
    }
  };
})();