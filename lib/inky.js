const cheerio = require('cheerio');
module.exports = Inky;

/**
 * Creates a new instance of the Inky parser.
 * @class
 * @param {object} options Options for the parser, including a list of custom components to parse and pass-through options for cheerio (eg, `{ components: { fooContainer: 'foo-box', fooItem: 'foo' }, otherInkyOption: bar, cheerio: { cheerioOption: foo } }`)
 */
function Inky (options) {
  options = options || {};
  this.cheerioOpts = options.cheerio;
  this.columnCount = options.columnCount || 12;
  this.returnAsXML = options.returnAsXML;

  // HTML tags for Inky custom components - merge defaults with additional user-defined tags
  this.components = Object.assign({
    button: 'button',
    row: 'row',
    columns: 'columns',
    container: 'container',
    callout: 'callout',
    inky: 'inky',
    blockGrid: 'block-grid',
    menu: 'menu',
    menuItem: 'item',
    center: 'center',
    spacer: 'spacer',
    wrapper: 'wrapper'
  }, options.components || {});

  this.componentTags = Object.values(this.components);
}

/**
 * Main parsing function. Takes in HTML as a string, checks if there are any custom components. If there are, it replaces the nested components, traverses the DOM and replaces them with email markup.
 * @param {string} html Source XML/HTML string, with Inky markup
 * @param {object} cheerioOpts Options for cheerio - see https://github.com/cheeriojs/cheerio#loading
 * @returns {string} Table-based HTML generated from the Inky markup
 */
Inky.prototype.releaseTheKraken = function (html, cheerioOpts) {
  const extractRawsOutput = Inky.extractRaws(html);
  const raws = extractRawsOutput.rawInnerContentItems;
  html = extractRawsOutput.htmlWithRawPlaceholders;

  cheerioOpts = Inky.mergeCheerioOpts(cheerioOpts);
  const $ = cheerio.load(html, cheerioOpts);

  // This large compound selector looks for any custom tag loaded into Inky
  // <center> is an exception: the selector is center:not([data-parsed])
  // Otherwise the parser gets caught in an infinite loop where it continually tries to process the same <center> tags
  const tags = this.componentTags.map(function (tag) {
    if (tag === 'center') {
      return tag + ':not([data-parsed])';
    }
    return tag;
  }).join(', ');

  // Because the structure of the DOM constantly shifts, we carefully go through each custom tag one at a time, until there are no more custom tags to parse
  while ($(tags).length > 0) {
    let elem = $(tags).eq(0);
    elem.replaceWith(this.componentFactory(elem));
  }

  // Remove data-parsed attributes created for <center>
  $('[data-parsed]').removeAttr('data-parsed');

  // Obtain HTML or XML document from cheerio and re-inject the extracted `<raw>` content
  if (!!this.returnAsXML && this.returnAsXML === true) {
    html = $.xml();
  } else {
    html = $.root().html();
  }
  html = Inky.reInjectRaws(raws, html);

  return html;
};

/**
 * Merges an options object with the defined defaults and returns the result.
 * @param {object} cheerioOpts
 * @returns {object}
 */
Inky.mergeCheerioOpts = function (cheerioOpts) {
  const defaultCheerioOptions = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: false
  };

  cheerioOpts = Object.assign(defaultCheerioOptions, cheerioOpts);

  return cheerioOpts;
};

/**
 * Extracts and tags `<raw>` content to be re-inserted after all other processing.
 * For each `<raw>` element in the input string, the inner content is extracted and placed in an array. The complete element is replaced with
 * the string `###RAWi###`, where `i` is the corresponding index in the array.
 * @param {string} html The input XML/HTML string
 * @returns {{htmlWithRawPlaceholders: string, rawInnerContentItems: array}} An object containing: the HTML content with ###RAW### placeholders and an array of the raw elements' inner content
 */
Inky.extractRaws = function (html) {
  let raws = [];
  let i = 0;
  let rawMatch;
  const rawTagRegex = /<raw>(.*?)<\/raw>/i;

  while ((rawMatch = html.match(rawTagRegex)) !== null) {
    raws[i] = rawMatch[1];  // Place the contents of the match group in the array
    html = html.replace(rawTagRegex, '###RAW' + i + '###'); // Replace the complete element with the placeholder tag
    i++;
  }

  return {
    htmlWithRawPlaceholders: html,
    rawInnerContentItems: raws
  };
};

/**
 * Re-injects the content extracted from `<raw>` elements.
 * Given an array of raws, the html string is searched tags of the format `###RAWi###`, where `i`
 * is the corresponding index in the array of extracted raws. Each tag is replaced with the inner content that was
 * previously extracted from the corresponding `<raw>` element.
 * @param {array} raws An array of the raw elements' inner content
 * @param {string} html The HTML content with ###RAW### placeholders
 * @returns {string} The HTML content with the inner content of the `<raw>` elements in place
 */
Inky.reInjectRaws = function (raws, html) {
  for (let i = 0; i < raws.length; i++) {
    html = html.replace('###RAW' + i + '###', raws[i]);
  }

  return html;
};

Inky.prototype.componentFactory = require('./componentFactory');

Inky.prototype.makeColumn = require('./makeColumn');
