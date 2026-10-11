/**
 * Manages the Live Preview Iframe & Console logging
 */
export class LivePreview {
  constructor(iframeElement, onConsoleLog = null) {
    this.iframe = iframeElement;
    this.onConsoleLog = onConsoleLog;
    this.debounceTimer = null;
    this.setupConsoleListener();
  }

  setupConsoleListener() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.source === 'iframe-console') {
        if (typeof this.onConsoleLog === 'function') {
          this.onConsoleLog(event.data.type, event.data.args);
        }
      }
    });
  }

  /**
   * Update the live iframe with combined HTML and CSS
   * @param {string} htmlCode 
   * @param {string} cssCode 
   * @param {number} delay 
   */
  update(htmlCode, cssCode = '', delay = 150) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.render(htmlCode, cssCode);
    }, delay);
  }

  render(htmlCode, cssCode) {
    const consoleInterceptorScript = `
      <script>
        (function() {
          function sendLog(type, args) {
            try {
              window.parent.postMessage({
                source: 'iframe-console',
                type: type,
                args: Array.from(args).map(arg => {
                  if (typeof arg === 'object') {
                    try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                  }
                  return String(arg);
                })
              }, '*');
            } catch(e) {}
          }
          const _log = console.log;
          const _warn = console.warn;
          const _error = console.error;
          console.log = function(...args) { _log.apply(console, args); sendLog('info', args); };
          console.warn = function(...args) { _warn.apply(console, args); sendLog('warn', args); };
          console.error = function(...args) { _error.apply(console, args); sendLog('error', args); };
          window.onerror = function(msg, url, line) {
            sendLog('error', [\`Error: \${msg} (Line \${line})\`]);
          };
        })();
      </script>
    `;

    const fullDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${consoleInterceptorScript}
  <style>
    ${cssCode || ''}
  </style>
</head>
<body>
  ${htmlCode || ''}
</body>
</html>
    `;

    const blob = new Blob([fullDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    this.iframe.src = url;
  }
}
