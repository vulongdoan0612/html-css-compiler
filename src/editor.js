import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { html } from '@codemirror/lang-html';
import { css, cssLanguage } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { yCollab } from 'y-codemirror.next';

/**
 * Rich CSS Property & Value Autocomplete List
 */
const cssPropertyCompletions = [
  // Display & Layout
  { label: 'display', type: 'property', detail: 'Display layout mode', apply: 'display: ' },
  { label: 'position', type: 'property', detail: 'Positioning scheme', apply: 'position: ' },
  { label: 'top', type: 'property', detail: 'Top offset position', apply: 'top: ' },
  { label: 'right', type: 'property', detail: 'Right offset position', apply: 'right: ' },
  { label: 'bottom', type: 'property', detail: 'Bottom offset position', apply: 'bottom: ' },
  { label: 'left', type: 'property', detail: 'Left offset position', apply: 'left: ' },
  { label: 'z-index', type: 'property', detail: 'Z-index stacking order', apply: 'z-index: ' },
  { label: 'overflow', type: 'property', detail: 'Overflow behavior', apply: 'overflow: ' },
  { label: 'gap', type: 'property', detail: 'Grid and Flex gap spacing', apply: 'gap: ' },
  { label: 'justify-content', type: 'property', detail: 'Main axis alignment', apply: 'justify-content: ' },
  { label: 'align-items', type: 'property', detail: 'Cross axis alignment', apply: 'align-items: ' },

  // Sizing & Box Model
  { label: 'width', type: 'property', detail: 'Element width', apply: 'width: ' },
  { label: 'height', type: 'property', detail: 'Element height', apply: 'height: ' },
  { label: 'margin', type: 'property', detail: 'Outer margin space', apply: 'margin: ' },
  { label: 'padding', type: 'property', detail: 'Inner padding space', apply: 'padding: ' },

  // Backgrounds & Typography
  { label: 'color', type: 'property', detail: 'Text color', apply: 'color: ' },
  { label: 'background', type: 'property', detail: 'Background shorthand', apply: 'background: ' },
  { label: 'background-color', type: 'property', detail: 'Background color', apply: 'background-color: ' },
  { label: 'border-radius', type: 'property', detail: 'Border corner radius', apply: 'border-radius: ' },
  { label: 'font-family', type: 'property', detail: 'Font family stack', apply: 'font-family: ' },
  { label: 'font-size', type: 'property', detail: 'Text font size', apply: 'font-size: ' },
  { label: 'font-weight', type: 'property', detail: 'Font weight', apply: 'font-weight: ' }
];

function cssCompletionSource(context) {
  const word = context.matchBefore(/[\w-]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  return {
    from: word.from,
    options: cssPropertyCompletions,
    validFor: /^[\w-]*$/
  };
}

const customEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: '#0d1117'
  },
  '.cm-content': {
    fontFamily: '"Fira Code", monospace',
    caretColor: '#38bdf8'
  },
  '.cm-cursor': {
    borderLeftColor: '#38bdf8'
  },
  '.cm-gutters': {
    backgroundColor: '#090d16',
    color: '#4b5563',
    borderRight: '1px solid #1f293d'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#1f293d',
    border: '1px solid #334155',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
  }
}, { dark: true });

/**
 * Setup CodeMirror Editor instance with Yjs collaboration support
 * @param {HTMLElement} containerElement 
 * @param {string} mode 'html' | 'css'
 * @param {string} initialValue 
 * @param {function} onChange 
 * @param {object} yjsBinding { yText, provider }
 * @returns {EditorView}
 */
export function createCodeEditor(containerElement, mode = 'html', initialValue = '', onChange = null, yjsBinding = null) {
  let languageExtension;
  let customAutocomplete = null;

  if (mode === 'html') {
    languageExtension = html({
      autoCloseTags: true,
      matchClosingTags: true
    });
  } else if (mode === 'css') {
    languageExtension = css();
    customAutocomplete = cssLanguage.data.of({
      autocomplete: cssCompletionSource
    });
  }

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && typeof onChange === 'function') {
      onChange(update.state.doc.toString());
    }
  });

  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion({ activateOnTyping: true }),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab
    ]),
    languageExtension,
    oneDark,
    customEditorTheme,
    updateListener
  ];

  if (customAutocomplete) {
    extensions.push(customAutocomplete);
  }

  // Inject Yjs Y-Codemirror Collaboration Extension if available
  if (yjsBinding && yjsBinding.yText && yjsBinding.provider) {
    extensions.push(yCollab(yjsBinding.yText, yjsBinding.provider.awareness));
  }

  const state = EditorState.create({
    doc: initialValue,
    extensions
  });

  const view = new EditorView({
    state,
    parent: containerElement
  });

  return view;
}
