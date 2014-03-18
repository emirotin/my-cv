"use strict";

var path = require( "path" )
  , _ = require( "lodash" )
  , config = require( "./config" )
  , getExtensions = function ( mimosaConfig ) {
    return mimosaConfig.coffeescript.extensions;
  };

var compile = function ( mimosaConfig, file, cb ) {
  var error
    , output
    , sourceMap
    , coffeeConfig = mimosaConfig.coffeescript
    , compiler = coffeeConfig.lib
    , options = _.extend( {}, mimosaConfig.coffeescript.options, { sourceFiles:[ path.basename( file.inputFileName ) + ".src" ] } );

  // set if literate
  if ( compiler.helpers && compiler.helpers.isLiterate ) {
    options.literate = compiler.helpers.isLiterate( file.inputFileName );
  }

  // Check if source maps have been excluded for this file
  if ( options.sourceMap ) {
    if ( coffeeConfig.sourceMapExclude && coffeeConfig.sourceMapExclude.indexOf( file.inputFileName ) > -1 ) {
      options.sourceMap = false;
    } else {
      if ( coffeeConfig.sourceMapExcludeRegex && file.inputFileName.match( coffeeConfig.sourceMapExcludeRegex ) ) {
        options.sourceMap = false;
      }
    }
  }

  try {
    output = compiler.compile( file.inputFileText, options );

    // set source maps if available
    if ( output.v3SourceMap ) {
      sourceMap = output.v3SourceMap;
      output = output.js;
    }
  } catch ( err ) {
    var line = "unknown";
    var column = "unknown";
    if ( err.location ) {
      /*eslint camelcase:0*/
      line = err.location.first_line;
      column = err.location.first_column;
    }
    error = err + " line " + line + ", column " + column;
  }

  cb( error, output, coffeeConfig, sourceMap );
};

module.exports = {
  name: "coffee",
  compilerType: "javascript",
  compile: compile,
  extensions: getExtensions,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate,
  cleanUpSourceMaps: true
};
