import beautify from 'js-beautify';

/**
 * Format HTML code to pretty format
 * @param {string} code 
 * @param {object} options 
 * @returns {string}
 */
export function formatHTML(code, options = {}) {
  if (!code || !code.trim()) return code;

  const defaultOptions = {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 1,
    preserve_newlines: true,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: false,
    wrap_line_length: 0,
    indent_inner_html: true,
    comma_first: false,
    eols: '\n',
    indent_empty_lines: false,
    wrap_attributes: 'auto',
    ...options
  };

  try {
    return beautify.html(code, defaultOptions);
  } catch (err) {
    console.error('Failed to format HTML:', err);
    return code;
  }
}

/**
 * Format CSS code to pretty format
 * @param {string} code 
 * @param {object} options 
 * @returns {string}
 */
export function formatCSS(code, options = {}) {
  if (!code || !code.trim()) return code;

  const defaultOptions = {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 1,
    preserve_newlines: true,
    end_with_newline: false,
    space_around_combinator: true,
    ...options
  };

  try {
    return beautify.css(code, defaultOptions);
  } catch (err) {
    console.error('Failed to format CSS:', err);
    return code;
  }
}
