var Inky = require('../lib/inky');
var parse = require('..');
var cheerio = require('cheerio');
var assert = require('assert');
var fs = require('fs');
var rimraf = require('rimraf');
var vfs = require('vinyl-fs');
var compare = require('./lib/compare');

describe('Inky', () => {
  it('can take in settings in the constructor', () => {
    var config = {
      components: { column: 'col' },
      columnCount: 16
    };

    var inky = new Inky(config);

    assert.equal(inky.components.column, 'col', 'Sets custom component tags');
    assert.equal(inky.columnCount, 16, 'Sets a custom column count');
  });

  it('should have an array of component tags', () => {
    var inky = new Inky();
    assert(Array.isArray(inky.componentTags), 'Inky.zftags is an array');
  });

  it(`doesn't choke on inline elements`, () => {
    var input = '<container>This is a link to <a href="#">ZURB.com</a>.</container>';
    var expected = `
      <table align="center" class="container">
        <tbody>
          <tr>
            <td>This is a link to <a href="#">ZURB.com</a>.</td>
          </tr>
        </tbody>
      </table>
    `;

    compare(input, expected);
  });

  it(`doesn't choke on special characters`, () => {
    var input = '<container>This is a link tö <a href="#">ZURB.com</a>.</container>';
    var expected = `
      <table align="center" class="container">
        <tbody>
          <tr>
            <td>This is a link tö <a href="#">ZURB.com</a>.</td>
          </tr>
        </tbody>
      </table>
    `;

    compare(input, expected);
  });

  it(`doesn't convert these characters into entities`, () => {
    var input = "<container>There's &nbsp; some amazing things here!</container>";
    var expected = `
      <table align="center" class="container">
        <tbody>
          <tr>
            <td>There's &nbsp; some amazing things here!</td>
          </tr>
        </tbody>
      </table>
    `;

    compare(input, expected);
  });

  it(`doesn't decode entities if non default cheerio config is given`, () => {
    var input = '<container>"should not replace quotes or non-breaking&nbsp;space"</container>';
    var expected = `
      <table align="center" class="container">
        <tbody>
          <tr>
            <td>"should not replace quotes or non-breaking&nbsp;space"</td>
          </tr>
        </tbody>
      </table>
    `;

    compare(input, expected, { decodeEntities: false });
  });

  it(`doesn't muck with stuff inside raw`, () => {
    var input = '<raw><%= test %></raw>';
    var expected = '<%= test %>';

    compare(input, expected);
  });

  it(`can handle multiple raw tags`, () => {
    var input = '<h1><raw><%= test %></raw></h1><h2><raw>!!!</raw></h2>';
    var expected = '<h1><%= test %></h1><h2>!!!</h2>';

    compare(input, expected);
  });

  it(`can handle an XHTML 1.0 Transitional document`, () => {
    var input = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Conforming XHTML 1.0 Transitional Template</title>
</head>
<body>
</body>
</html>`;
    var expected = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Conforming XHTML 1.0 Transitional Template</title>
</head>
<body>
</body>
</html>`;

    compare(input, expected);
  });

  it(`can handle a more complex XHTML 1.0 Transitional document`, () => {
    var input = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Conforming XHTML 1.0 Transitional Template</title>
<link rel="stylesheet" href="https://example.com/example.css"/>
<meta name="generator" content="Inky"/>
</head>
<body>
<h1>Foo</h1>
<p id="section-1">
Hello <a href="https://example.com">World</a>.<br />
<img src="https://example.com/foo.jpg" alt="Foo"/>
</p>
<hr/>
<p id="section-2">
Goodbye.
</p>
</body>
</html>`;
    var expected = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Conforming XHTML 1.0 Transitional Template</title>
<link rel="stylesheet" href="https://example.com/example.css"/>
<meta name="generator" content="Inky"/>
</head>
<body>
<h1>Foo</h1>
<p id="section-1">
Hello <a href="https://example.com">World</a>.<br />
<img src="https://example.com/foo.jpg" alt="Foo"/>
</p>
<hr/>
<p id="section-2">
Goodbye.
</p>
</body>
</html>`;

    compare(input, expected);
  });

  it(`can handle a more complex HTML 5 document`, () => {
    var input = `<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

    <title>Hello, world!</title>
  </head>
  <body>
    <h1>Hello, world!</h1>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://example.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <script src="https://example.com/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://example.com/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  </body>
</html>`;
    var expected = `<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

    <title>Hello, world!</title>
  </head>
  <body>
    <h1>Hello, world!</h1>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://example.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
    <script src="https://example.com/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="https://example.com/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  </body>
</html>`;

    compare(input, expected, {xml: false});
  });

  it(`can handle a self-closing tag`, () => {
    var input = '<h1>Hello<br/>World!</h1>';
    var expected = '<h1>Hello<br/>World!</h1>';

    compare(input, expected);
  });

  it(`can self-close a void tag that is not closed`, () => {
    var input = '<h1>Hello<br>World!</h1>';
    var expected = '<h1>Hello<br />World!</h1>';

    compare(input, expected);
  });


});

describe('Inky wrappers', () => {
  const INPUT = 'test/fixtures/test.html';
  const OUTPUT = 'test/fixtures/_build';
  const OUTFILE = 'test/fixtures/_build/test.html';

  afterEach(done => {
    rimraf(OUTPUT, done);
  });

  it('can process a glob of files', done => {
    parse({
      src: INPUT,
      dest: OUTPUT
    }, () => {
      assert(fs.existsSync(OUTFILE), 'Output file exists');
      done();
    });
  });

  it('can process a Gulp stream of files', done => {
    vfs.src(INPUT)
      .pipe(parse())
      .pipe(vfs.dest(OUTPUT))
      .on('finish', () => {
        assert(fs.existsSync(OUTFILE), 'Output file exists');
        done();
      });
  });
});
