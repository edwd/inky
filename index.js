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

module.exports = function (opts, cb) {
  opts = opts || {};
  opts.cheerio = Inky.mergeCheerioOpts(opts.cheerio);

  if (typeof inky === 'undefined') {
    inky = new Inky(opts);
  }

  let stream;

  // If the user passed in source files, create a stream
  if (opts.src) {
    stream = vfs.src(opts.src).pipe(transform());

    if (opts.dest && typeof cb === 'function') {
      stream.on('finish', cb);
    }
  }
  // Otherwise, return the transform function
  else {
    return transform();
  }

  /**
   * This transform function takes in a Vinyl HTML file, converts the code from Inky to HTML, and returns the modified file via callback.
   * If a `dest` option was provided, the file will be written to disk.
   */
  function transform () {
    return through.obj(function (file, enc, callback) {
      const convertedHtml = inky.releaseTheKraken(file.contents.toString(),
        opts.cheerio);

      file.contents = Buffer.from(convertedHtml);

      if (typeof opts.dest === 'string') {
        // Write to disk manually if the user specified it by providing a file path in the `dest` key of the options
        const outputPath = path.join(opts.dest, path.basename(file.path));
        fs.mkdir(opts.dest, { recursive: true }, function (err) {
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