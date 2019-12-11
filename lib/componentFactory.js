const format = require('util').format;
const $ = require('cheerio');
const getAttrs = require('./util/getAttrs');

/**
 * componentFactory module
 * @module componentFactory
 */

/**
 * Returns HTML markup for an Inky element
 * @todo This could be refactored to handle both cols and subcols.
 * @param {object} element Inky markup for the element as a cheerio object
 * @returns {string} Table-based HTML for the element
 */
module.exports = function (element) {
  var inner = element.html();
  var attrs = getAttrs(element);

  switch (element[0].name) {
    // <column>
    case this.components.columns:
      return this.makeColumn(element, 'columns');

    // <row>
    case this.components.row:
      var classes = ['row'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }

      return format('<table %s class="%s"><tbody><tr>%s</tr></tbody></table>',
        attrs, classes.join(' '), inner);

    // <button>
    case this.components.button:
      var expander = '';

      // Prepare optional target attribute for the <a> element
      var target = '';
      if (element.attr('target')) {
        target = ' target=' + element.attr('target');
      }

      // If we have the href attribute we can create an anchor for the inner of the button;
      if (element.attr('href')) {
        inner = format('<a href="%s"%s>%s</a>', element.attr('href'), target,
          inner);
      }

      // If the button is expanded, it needs a <center> tag around the content
      if (element.hasClass('expand') || element.hasClass('expanded')) {
        inner = format('<center>%s</center>', inner);
        expander = '\n<td class="expander"></td>';
      }

      // The .button class is always there, along with any others on the <button> element
      var classes = ['button'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }

      return format(
        '<table class="%s"><tr><td><table><tr><td>%s</td></tr></table></td>%s</tr></table>',
        classes.join(' '), inner, expander);

    // <container>
    case this.components.container:
      var classes = ['container'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }

      return format(
        '<table %s align="center" class="%s"><tbody><tr><td>%s</td></tr></tbody></table>',
        attrs, classes.join(' '), inner);

    // <inky>
    case this.components.inky:
      return '<tr><td><img src="https://raw.githubusercontent.com/arvida/emoji-cheat-sheet.com/master/public/graphics/emojis/octopus.png" /></tr></td>';

    // <block-grid>
    case this.components.blockGrid:
      var classes = ['block-grid', 'up-' + element.attr('up')];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }
      return format('<table class="%s"><tr>%s</tr></table>', classes.join(' '),
        inner);

    // <menu>
    case this.components.menu:
      var classes = ['menu'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }
      return format(
        '<table %s class="%s"><tr><td><table><tr>%s</tr></table></td></tr></table>',
        attrs, classes.join(' '), inner);

    // <item>
    case this.components.menuItem:
      // Prepare optional target attribute for the <a> element
      var target = '';
      if (element.attr('target')) {
        target = ' target=' + element.attr('target');
      }
      var classes = ['menu-item'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }
      return format('<th %s class="%s"><a href="%s"%s>%s</a></th>', attrs,
        classes.join(' '), element.attr('href'), target, inner);

    // <center>
    case this.components.center:
      if (element.children().length > 0) {
        const blockLevelElements = [
          'ADDRESS',
          'BLOCKQUOTE',
          'CENTER',
          'DIR',
          'DIV',
          'DL',
          'FIELDSET',
          'FORM',
          'H1',
          'H2',
          'H3',
          'H4',
          'H5',
          'H6',
          'HR',
          'ISINDEX',
          'MENU',
          'NOFRAMES',
          'NOSCRIPT',
          'OL',
          'P',
          'PRE',
          'TABLE',
          'UL',
          'DD',
          'DT',
          'FRAMESET',
          'LI',
          'TBODY',
          'TD',
          'TFOOT',
          'TH',
          'THEAD',
          'TR'];

        element.children().each(function () {
          if (blockLevelElements.includes($(this).prop('tagName'))) {
            // Only add the `align="center"` attribute if the child element of `<center>` is a block-level element
            $(this).attr('align', 'center');
          }
          $(this).addClass('float-center');
        });
        element.find('item, .menu-item').addClass('float-center');
      }

      element.attr('data-parsed', '');

      return format('%s', $.html(element, this.cheerioOpts));

    // <callout>
    case this.components.callout:
      var classes = ['callout-inner'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }

      return format(
        '<table %s class="callout"><tr><th class="%s">%s</th><th class="expander"></th></tr></table>',
        attrs, classes.join(' '), inner);

    // <spacer>
    case this.components.spacer:
      var classes = ['spacer'];
      var size;
      var html = '';
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }
      if (element.attr('size-sm') || element.attr('size-lg')) {
        // The formatting placeholders are as follows:
        //  - The element's existing class list
        //  - The element's non-ignored attributes

        if (element.attr('size-sm')) {
          size = (element.attr('size-sm'));
          html += '<table class="%s hide-for-large"><tbody><tr><td %s height="' +
            size + '" style="font-size:' + size + 'px;line-height:' + size +
            'px;">&nbsp;</td></tr></tbody></table>';
        }
        if (element.attr('size-lg')) {
          size = (element.attr('size-lg'));
          html += '<table class="%s show-for-large"><tbody><tr><td %s height="' +
            size + '" style="font-size:' + size + 'px;line-height:' + size +
            'px;">&nbsp;</td></tr></tbody></table>';
        }
      } else {
        size = (element.attr('size')) || 16;
        html += '<table class="%s"><tbody><tr><td %s height="' + size +
          '" style="font-size:' + size + 'px;line-height:' + size +
          'px;">&nbsp;</td></tr></tbody></table>';
      }

      if (element.attr('size-sm') && element.attr('size-lg')) {
        // When both `size-sm` and `size-lg` are present, `html` will contain two sets of the markup, concatenated. The placeholders will appear twice, so pass in the substitution values twice (respectively).
        return format(html, classes.join(' '), attrs, classes.join(' '), attrs);
      } else {
        return format(html, classes.join(' '), attrs);
      }

    // <wrapper>
    case this.components.wrapper:
      var classes = ['wrapper'];
      if (element.attr('class')) {
        classes = classes.concat(element.attr('class').split(' '));
      }

      return format(
        '<table %s class="%s" align="center"><tr><td class="wrapper-inner">%s</td></tr></table>',
        attrs, classes.join(' '), inner);

    default:
      // If it's not a custom component, return it as-is
      return format('<tr><td>%s</td></tr>', $.html(element, this.cheerioOpts));
  }
};
