const format = require('util').format;
const $ = require('cheerio');
const getAttrs = require('./util/getAttrs');

/**
 * Returns HTML markup for Inky `<column>` elements
 * @todo This could be refactored to handle both cols and subcols.
 * @param {object|string} column Inky markup for the column, as a cheerio object or a string
 * @returns {string} Table-based HTML markup for the column
 */
module.exports = function (column) {
  const inner = $(column).html();
  let classes = [];
  let expander = '';
  const attrs = getAttrs(column);

  // Add 1 to include current column
  var columnsInCurrentGroup = $(column).siblings().length + 1;

  // Inherit classes from the <column> tag
  if ($(column).attr('class')) {
    classes = classes.concat($(column).attr('class').split(' '));
  }

  /*
  Determine small and large sizes for this column, according to these rules:
    - The small size is taken from the `small` attribute; if not present, use the current configured column count (defaults to 12)
    - The large size is taken from the `large` attribute; if not present, use the `small` attribute; if both not present, divide the
      current configured column count by the number of columns in this group (so that the space is divided evenly, rounded down)
   */
  const smallSize = parseInt($(column).attr('small'), 10) || this.columnCount;
  const largeSize = parseInt($(column).attr('large'), 10) ||
    parseInt($(column).attr('small'), 10) ||
    Math.floor(this.columnCount / columnsInCurrentGroup);

  // The noExpander flag is `true` when the `no-expander` attribute is present on this `<column>` and does not have a value of `"false"`
  const noExpander = (typeof $(column).attr('no-expander') !== 'undefined' &&
    $(column).attr('no-expander') !== 'false');

  classes.push(format('small-%s', smallSize));
  classes.push(format('large-%s', largeSize));

  // Add the basic "columns" class also
  classes.push('columns');

  // Search for additional columns as predecessor or successor siblings to determine if this is the first column, last column, or both
  if ($(column).prev(this.components.columns).length === 0) {
    classes.push('first');
  }
  if ($(column).next(this.components.columns).length === 0) {
    classes.push('last');
  }

  // If the column contains a nested row, the .expander class should not be used
  // Add an expander cell immediately after the column if the "large" size equals the full column
  /*
  Add an expander cell immediately after the column if these criteria are met:
   - The "large" size for the column equals the full column count
   - There are no rows nested in this column
   - The column did NOT have a 'no-expander' attribute (or had a 'no-expander' attribute equal to "false")
   */
  if (largeSize === this.columnCount && column.find('.row, row').length === 0 &&
    noExpander === false) {
    expander = '\n<th class="expander"></th>';
  }

  // Final HTML output
  let output = `<th class="%s" %s>
      <table>
        <tr>
          <th>%s</th>%s
        </tr>
      </table>
    </th>`;

  return format(output, classes.join(' '), attrs, inner, expander);
};
