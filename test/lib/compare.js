const Inky = require('../../lib/inky');
const cheerio = require('cheerio');
const htmlEqual = require('assert-html-equal');

/**
 * Takes HTML input, runs it through the Inky parser, and compares the output to what's expected.
 * @param {string} input - HTML input.
 * @param {string} expected - Expected HTML output.
 * @throws {Error} Throws an error if the output is not identical.
 */
module.exports = function compare(input, expected, cheerioOpts) {
  const defaultCheerioOptions = {
    xml: {
      withDomLvl1: false,
      normalizeWhitespace: false,
      xmlMode: false,
      decodeEntities: false
    }
  };

  cheerioOpts = Object.assign(defaultCheerioOptions, cheerioOpts);

  const inky = new Inky();
  const output = inky.releaseTheKraken(input, cheerioOpts);

  htmlEqual(output, expected);
};