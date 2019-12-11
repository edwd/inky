/**
 * @module getAttrs
 */

/**
 * Grabs all attributes from an element and returns them as a string, EXCLUDING `class`, `id`, `href`, and custom Inky attributes.
 * @param {object} el Element as a cheerio object
 * @returns {string} The extracted attributes, concatenated as valid HTML (eg, `bgcolor="#000000" align="left" checked`)
 */
module.exports = function (el) {
  const attrs = el.attr();
  let result = '';

  if (typeof attrs === 'undefined' || attrs === {}) {
    return result;
  }

  const ignoredAttributes = [
    'class',
    'id',
    'href',
    'size',
    'size-sm',
    'size-lg',
    'large',
    'no-expander',
    'small',
    'target'];

  for (const key in attrs) {
    if (ignoredAttributes.indexOf(key) === -1 &&
      Object.prototype.hasOwnProperty.call(attrs, key)) {
      result += (' ' + key + '=' + '"' + attrs[key] + '"');
    }
  }

  return result;
};