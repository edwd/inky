'use strict';
/**
 * @module Inky
 */
const path = require('path');
const through = require('through2');
const vfs = require('vinyl-fs');
const Inky = require('./lib/inky');
const fs = require('fs');

var inky;

module.exports = function (options, cb) {
  options = options || {};
  options.cheerio = Inky.mergeCheerioOpts(options.cheerio);

  if (typeof inky === 'undefined') {
    inky = new Inky(options);
  }

  // If the user passed in source files, create a stream
  if (options.src) {
    let stream = vfs.src(options.src).pipe(transform());

    if (options.dest && typeof cb === 'function') {
      stream.on('finish', cb);
    }
  }
  // Otherwise, return the transform function
  else {
    return transform(options);
  }

  /**
   * This transform function takes in a Vinyl HTML file, converts the code from Inky to HTML, and returns the modified file via callback.
   * If a `dest` option was provided, the file will be written to disk.
   */
  function transform (options) {
    options = options || {};
    options.cheerio = Inky.mergeCheerioOpts(options.cheerio);

    return through.obj(function (file, enc, callback) {
      const convertedHtml = inky.releaseTheKraken(file.contents.toString(), options.cheerio);

      file.contents = Buffer.from(convertedHtml);

      if (typeof options.dest === 'string') {
        // Write to disk manually if the user specified it by providing a file path in the `dest` key of the options
        const outputPath = path.join(options.dest, path.basename(file.path));
        fs.mkdir(options.dest, { recursive: true }, function (err) {
          if (!err) {
            fs.writeFile(outputPath, convertedHtml, callback);
          } else {
            callback(err, null);
          }
        });
      } else {
        callback(null, file);
      }
    });
  }
};

module.exports.Inky = Inky;