import { createIcons, icons } from 'lucide';
import { createCodeEditor } from './editor.js';
import { formatHTML, formatCSS } from './formatter.js';
import { LivePreview } from './preview.js';
import { defaultTemplates } from './templates.js';
import { CollaborationManager } from './collaboration.js';

// Global Application State (Strictly HTML & CSS)
const STATE = {
  htmlCode: '',
  cssCode: '',
  activeTab: 'html',
  activeDevice: 'desktop',
  autoSaveKey: 'html_css_compiler_data_v3',
  consoleLogs: [],
  roomName: 'phong-hoc-01',
  userName: 'Thầy Giáo',
  userRole: 'teacher'
};

// DOM Element Selectors
const elements = {
  // Editors
  htmlContainer: document.getElementById('editor-html-container'),
  cssContainer: document.getElementById('editor-css-container'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  
  // Resizer & Layout
  editorWrapper: document.getElementById('editor-wrapper'),
  previewWrapper: document.getElementById('preview-wrapper'),
  resizer: document.getElementById('drag-resizer'),
  
  // Preview
  iframe: document.getElementById('preview-iframe'),
  iframeWrapper: document.getElementById('iframe-wrapper'),
  deviceBtns: document.querySelectorAll('.device-btn'),
  dimensionBadge: document.getElementById('dimension-badge'),
  btnFullscreen: document.getElementById('btn-fullscreen'),
  
  // Console
  consolePanel: document.getElementById('console-panel'),
  consoleHeader: document.getElementById('console-header'),
  consoleLogs: document.getElementById('console-logs'),
  consoleCount: document.getElementById('console-count'),
  btnToggleConsole: document.getElementById('btn-toggle-console'),
  btnClearConsole: document.getElementById('btn-clear-console'),
  consoleChevron: document.getElementById('console-chevron'),

  // Header Actions
  btnFormat: document.getElementById('btn-format'),
  btnCopy: document.getElementById('btn-copy'),
  btnDownload: document.getElementById('btn-download'),
  btnTemplates: document.getElementById('btn-templates'),
  btnClear: document.getElementById('btn-clear'),
  btnShareRoom: document.getElementById('btn-share-room'),
  realtimeStatusTag: document.getElementById('realtime-status-tag'),
  usersOnlineBadge: document.getElementById('users-online-badge'),
  footerConnStatus: document.getElementById('footer-connection-status'),
  
  // Room Modal
  roomModal: document.getElementById('room-modal'),
  btnCloseRoomModal: document.getElementById('btn-close-room-modal'),
  inputRoomId: document.getElementById('input-room-id'),
  inputUserName: document.getElementById('input-user-name'),
  selectUserRole: document.getElementById('select-user-role'),
  btnConnectRoom: document.getElementById('btn-connect-room'),
  btnCopyRoomLink: document.getElementById('btn-copy-room-link'),
  
  // Footer
  statsChars: document.getElementById('stats-chars'),
  statusSaved: document.getElementById('status-saved'),
  
  // Modal
  templateModal: document.getElementById('template-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  templateGrid: document.getElementById('template-grid'),

  // Toast
  toastContainer: document.getElementById('toast-container')
};

// CodeMirror View Instances & Collab
let htmlEditor, cssEditor;
let livePreview;
let collabManager = null;

/**
 * Initialize application
 */
function init() {
  // 1. Initialize Lucide Icons
  createIcons({ icons });

  // 2. Parse URL parameters for room & role
  parseUrlParams();

  // 3. Load saved code from LocalStorage or Default Template
  loadSavedData();

  // 4. Initialize Collaboration Engine (Yjs + Y-Websocket)
  initCollaboration();

  // 5. Initialize Live Preview Compiler
  livePreview = new LivePreview(elements.iframe, (type, args) => {
    appendConsoleLog(type, args);
  });

  // 6. Initial Compilation Render
  livePreview.update(STATE.htmlCode, STATE.cssCode, 0);

  // 7. Setup Event Listeners
  setupEventListeners();

  // 8. Render Template Modal Grid
  renderTemplates();

  // 9. Update Footer Stats
  updateStats();
}

/**
 * Parse URL Query Parameters
 */
function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('room')) STATE.roomName = urlParams.get('room');
  if (urlParams.has('role')) STATE.userRole = urlParams.get('role');
  if (urlParams.has('name')) STATE.userName = urlParams.get('name');

  elements.inputRoomId.value = STATE.roomName;
  elements.inputUserName.value = STATE.userName;
  elements.selectUserRole.value = STATE.userRole;
}

/**
 * Initialize Yjs Collaboration Engine
 */
function initCollaboration() {
  if (collabManager) {
    collabManager.provider.destroy();
  }

  collabManager = new CollaborationManager(null, STATE.roomName, {
    name: STATE.userName,
    role: STATE.userRole
  });

  // Re-create CodeMirror editors with Yjs Bindings
  elements.htmlContainer.innerHTML = '';
  elements.cssContainer.innerHTML = '';

  htmlEditor = createCodeEditor(
    elements.htmlContainer, 
    'html', 
    STATE.htmlCode, 
    (val) => {
      STATE.htmlCode = val;
      onCodeChange();
    },
    { yText: collabManager.yTextHTML, provider: collabManager.provider }
  );

  cssEditor = createCodeEditor(
    elements.cssContainer, 
    'css', 
    STATE.cssCode, 
    (val) => {
      STATE.cssCode = val;
      onCodeChange();
    },
    { yText: collabManager.yTextCSS, provider: collabManager.provider }
  );

  // Observe Yjs Text changes from remote collaborators
  collabManager.yTextHTML.observe(() => {
    STATE.htmlCode = collabManager.yTextHTML.toString();
    livePreview.update(STATE.htmlCode, STATE.cssCode, 50);
    updateStats();
  });

  collabManager.yTextCSS.observe(() => {
    STATE.cssCode = collabManager.yTextCSS.toString();
    livePreview.update(STATE.htmlCode, STATE.cssCode, 50);
    updateStats();
  });

  // Auto-sync room HTML & CSS content immediately when Yjs connects & syncs
  collabManager.provider.on('synced', (isSynced) => {
    if (isSynced) {
      STATE.htmlCode = collabManager.yTextHTML.toString();
      STATE.cssCode = collabManager.yTextCSS.toString();
      livePreview.update(STATE.htmlCode, STATE.cssCode, 0);
      updateStats();
    }
  });

  // Track Realtime Connection Status
  collabManager.onConnected((status) => {
    if (status === 'connected') {
      elements.realtimeStatusTag.textContent = `🟢 ONLINE: ${STATE.roomName}`;
      elements.realtimeStatusTag.style.background = 'rgba(16, 185, 129, 0.2)';
      elements.realtimeStatusTag.style.color = '#34d399';
      elements.footerConnStatus.textContent = `Yjs Realtime: Connected (${STATE.roomName})`;
      
      // Auto-sync current room content immediately
      STATE.htmlCode = collabManager.yTextHTML.toString();
      STATE.cssCode = collabManager.yTextCSS.toString();
      livePreview.update(STATE.htmlCode, STATE.cssCode, 0);
      updateStats();
    } else {
      elements.realtimeStatusTag.textContent = `🟡 DISCONNECTED`;
      elements.realtimeStatusTag.style.background = 'rgba(239, 68, 68, 0.2)';
      elements.realtimeStatusTag.style.color = '#f87171';
      elements.footerConnStatus.textContent = `Yjs Realtime: Disconnected`;
    }
  });

  // Track Awareness Online Users
  collabManager.provider.awareness.on('change', () => {
    const users = collabManager.getAwarenessUsers();
    elements.usersOnlineBadge.textContent = `👥 ${users.length} người đang online trong phòng`;
  });
}

/**
 * Handle Code Changes
 */
function onCodeChange() {
  livePreview.update(STATE.htmlCode, STATE.cssCode, 150);
  saveData();
  updateStats();
}

/**
 * Save code to local storage
 */
function saveData() {
  const payload = {
    html: STATE.htmlCode,
    css: STATE.cssCode
  };
  localStorage.setItem(STATE.autoSaveKey, JSON.stringify(payload));
}

/**
 * Load saved code or load default hero template
 */
function loadSavedData() {
  const saved = localStorage.getItem(STATE.autoSaveKey);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      STATE.htmlCode = data.html || '';
      STATE.cssCode = data.css || '';
      return;
    } catch (e) {
      console.error(e);
    }
  }

  // Default to clean blank state
  STATE.htmlCode = '';
  STATE.cssCode = '';
}

/**
 * Format Code Pretty
 */
function handleFormatPretty() {
  const formattedHTML = formatHTML(STATE.htmlCode);
  const formattedCSS = formatCSS(STATE.cssCode);

  STATE.htmlCode = formattedHTML;
  STATE.cssCode = formattedCSS;

  htmlEditor.dispatch({
    changes: { from: 0, to: htmlEditor.state.doc.length, insert: formattedHTML }
  });

  cssEditor.dispatch({
    changes: { from: 0, to: cssEditor.state.doc.length, insert: formattedCSS }
  });

  showToast('✨ Định dạng HTML & CSS pretty thành công!', 'success');
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Tab switching
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Format Pretty button
  elements.btnFormat.addEventListener('click', handleFormatPretty);

  // Copy Code button
  elements.btnCopy.addEventListener('click', () => {
    const combinedCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
${STATE.cssCode}
  </style>
</head>
<body>
${STATE.htmlCode}
</body>
</html>`;
    
    navigator.clipboard.writeText(combinedCode);
    showToast('📋 Đã sao chép mã HTML + CSS vào Clipboard!', 'info');
  });

  // Download File button
  elements.btnDownload.addEventListener('click', () => {
    const combinedCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compiled HTML Document</title>
  <style>
${STATE.cssCode}
  </style>
</head>
<body>
${STATE.htmlCode}
</body>
</html>`;

    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);

    showToast('💾 Đã tải xuống file index.html!', 'success');
  });

  // Clear button
  elements.btnClear.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ mã nguồn HTML & CSS hiện tại?')) {
      STATE.htmlCode = '';
      STATE.cssCode = '';

      htmlEditor.dispatch({ changes: { from: 0, to: htmlEditor.state.doc.length, insert: '' } });
      cssEditor.dispatch({ changes: { from: 0, to: cssEditor.state.doc.length, insert: '' } });

      onCodeChange();
      showToast('🗑️ Đã xóa sạch dữ liệu mã nguồn.', 'info');
    }
  });

  // Room Modal Toggles
  elements.btnShareRoom.addEventListener('click', () => {
    elements.roomModal.classList.add('active');
  });

  elements.btnCloseRoomModal.addEventListener('click', () => {
    elements.roomModal.classList.remove('active');
  });

  elements.btnConnectRoom.addEventListener('click', () => {
    STATE.roomName = elements.inputRoomId.value.trim() || 'phong-hoc-01';
    STATE.userName = elements.inputUserName.value.trim() || 'Thầy Giáo';
    STATE.userRole = elements.selectUserRole.value;

    initCollaboration();
    elements.roomModal.classList.remove('active');
    showToast(`🚀 Đã kết nối vào phòng: ${STATE.roomName}`, 'success');
  });

  elements.btnCopyRoomLink.addEventListener('click', () => {
    const room = elements.inputRoomId.value.trim() || 'phong-hoc-01';
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}&role=student&name=HocSinh`;
    
    navigator.clipboard.writeText(link);
    showToast('📋 Đã sao chép liên kết phòng cho học sinh!', 'info');
  });

  // Device Toggle
  elements.deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const device = btn.getAttribute('data-device');
      setDeviceView(device);
    });
  });

  // Fullscreen Preview Toggle
  elements.btnFullscreen.addEventListener('click', () => {
    if (elements.iframe.requestFullscreen) {
      elements.iframe.requestFullscreen();
    }
  });

  // Resizer Pane Dragging
  setupResizer();

  // Console Drawer Toggles
  elements.consoleHeader.addEventListener('click', (e) => {
    if (e.target.closest('#btn-clear-console')) return;
    toggleConsolePanel();
  });

  elements.btnClearConsole.addEventListener('click', () => {
    STATE.consoleLogs = [];
    renderConsoleLogs();
  });

  // Templates Modal
  elements.btnTemplates.addEventListener('click', () => {
    elements.templateModal.classList.add('active');
  });

  elements.btnCloseModal.addEventListener('click', () => {
    elements.templateModal.classList.remove('active');
  });

  elements.templateModal.addEventListener('click', (e) => {
    if (e.target === elements.templateModal) {
      elements.templateModal.classList.remove('active');
    }
  });

  // Global Keyboard Shortcuts (Ctrl/Cmd + Shift + F => Format Pretty)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyF') {
      e.preventDefault();
      handleFormatPretty();
    }
  });
}

/**
 * Switch Active Code Editor Tab
 */
function switchTab(tab) {
  STATE.activeTab = tab;

  elements.tabBtns.forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');

  elements.htmlContainer.parentElement.querySelectorAll('.editor-pane').forEach(p => p.classList.remove('active'));

  if (tab === 'html') {
    elements.htmlContainer.classList.add('active');
    htmlEditor.focus();
  } else if (tab === 'css') {
    elements.cssContainer.classList.add('active');
    cssEditor.focus();
  }

  updateStats();
}

/**
 * Set Responsive Viewport Device Frame
 */
function setDeviceView(device) {
  STATE.activeDevice = device;
  elements.deviceBtns.forEach(b => b.classList.remove('active'));
  document.querySelector(`.device-btn[data-device="${device}"]`).classList.add('active');

  elements.iframeWrapper.className = `iframe-wrapper ${device}`;

  if (device === 'desktop') elements.dimensionBadge.textContent = '100%';
  else if (device === 'tablet') elements.dimensionBadge.textContent = '768px';
  else if (device === 'mobile') elements.dimensionBadge.textContent = '375px';
}

/**
 * Setup Resizer Split Pane Dragging
 */
function setupResizer() {
  let isDragging = false;

  elements.resizer.addEventListener('mousedown', () => {
    isDragging = true;
    elements.resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const containerWidth = document.querySelector('.main-container').clientWidth;
    let newLeftWidthPct = (e.clientX / containerWidth) * 100;
    
    newLeftWidthPct = Math.max(20, Math.min(80, newLeftWidthPct));

    elements.editorWrapper.style.width = `${newLeftWidthPct}%`;
    elements.previewWrapper.style.width = `${100 - newLeftWidthPct}%`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      elements.resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

/**
 * Console Logs Handling
 */
function appendConsoleLog(type, args) {
  STATE.consoleLogs.push({ type, args, time: new Date().toLocaleTimeString() });
  renderConsoleLogs();
}

function renderConsoleLogs() {
  elements.consoleLogs.innerHTML = '';
  elements.consoleCount.textContent = STATE.consoleLogs.length;

  STATE.consoleLogs.forEach(item => {
    const div = document.createElement('div');
    div.className = `log-entry ${item.type}`;
    div.innerHTML = `<span style="color: #64748b;">[${item.time}]</span> <span>${item.args.join(' ')}</span>`;
    elements.consoleLogs.appendChild(div);
  });

  elements.consoleLogs.scrollTop = elements.consoleLogs.scrollHeight;
}

function toggleConsolePanel() {
  const isCollapsed = elements.consolePanel.classList.toggle('collapsed');
  elements.consoleChevron.setAttribute('data-lucide', isCollapsed ? 'chevron-up' : 'chevron-down');
  createIcons({ icons });
}

/**
 * Render Preset Templates inside Modal
 */
function renderTemplates() {
  elements.templateGrid.innerHTML = '';
  defaultTemplates.forEach(tpl => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <h4>${tpl.name}</h4>
      <p>${tpl.description}</p>
    `;

    card.addEventListener('click', () => {
      if (confirm(`Bạn có muốn tải mẫu "${tpl.name}"? Thao tác này sẽ ghi đè lên mã hiện tại.`)) {
        STATE.htmlCode = tpl.html;
        STATE.cssCode = tpl.css;

        htmlEditor.dispatch({ changes: { from: 0, to: htmlEditor.state.doc.length, insert: tpl.html } });
        cssEditor.dispatch({ changes: { from: 0, to: cssEditor.state.doc.length, insert: tpl.css } });

        onCodeChange();
        elements.templateModal.classList.remove('active');
        showToast(`🎉 Tải mẫu "${tpl.name}" thành công!`, 'success');
      }
    });

    elements.templateGrid.appendChild(card);
  });
}

/**
 * Display Toast Notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Update Lines & Characters Statistics in Footer
 */
function updateStats() {
  let activeCode = STATE.htmlCode;
  if (STATE.activeTab === 'css') activeCode = STATE.cssCode;

  const lines = activeCode ? activeCode.split('\n').length : 0;
  const chars = activeCode ? activeCode.length : 0;

  elements.statsChars.textContent = `${STATE.activeTab.toUpperCase()} - Lines: ${lines} | Chars: ${chars}`;
}

// Start application
document.addEventListener('DOMContentLoaded', init);
