"use strict";

exports.defaults = function() {
  return {
    coffeescript: {
      extensions: ["coffee", "litcoffee"],
      sourceMapDynamic: true,
      sourceMapExclude: [/\/specs?\//, /_spec.js$/],
      sourceMapConditional: false,
      options: {
        sourceMap:true,
        bare:true
      }
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n" +
         "  coffeescript:              # config settings for the coffeescript compiler module\n" +
         "    lib: undefined           # use this property to provide a specific version of CoffeeScript\n" +
         "    extensions: [\"coffee\", \"litcoffee\"]  # default extensions for CoffeeScript files\n" +
         "    sourceMapDynamic: true   # whether or not to inline the source maps in the compiled JavaScript\n" +
         "    sourceMapExclude: [/\\/specs?\\//, /_spec.js$/] # files to exclude from source map generation\n" +
         "    sourceMapConditional: false # whether or not to use conditional source maps\n" +
         "    options:                 # options for the CoffeeScript compiler\n" +
         "      sourceMap:true         # whether or not to create source maps\n" +
         "      bare:true              # whether or not to use the default safety wrapper\n";
};

exports.validate = function(config, validators) {
  var errors = [];

  if ( validators.ifExistsIsObject( errors, "coffeescript config", config.coffeescript ) ) {

    if ( !config.coffeescript.lib ) {
      config.coffeescript.lib = require( "coffee-script" );
    }

    if ( validators.isArrayOfStringsMustExist( errors, "coffeescript.extensions", config.coffeescript.extensions ) ) {
      if (config.coffeescript.extensions.length === 0) {
        errors.push( "coffeescript.extensions cannot be an empty array");
      }
    }

    if ( config.isBuild ) {
      config.coffeescript.sourceMap = false;
    } else {
      validators.ifExistsIsBoolean( errors, "coffee.sourceMapConditional", config.coffeescript.sourceMapConditional );

      if ( validators.ifExistsIsBoolean( errors, "coffee.sourceMapDynamic", config.coffeescript.sourceMapDynamic ) ) {
        if (config.isWatch && config.isMinify && config.coffeescript.sourceMapDynamic ) {
          config.coffeescript.sourceMapDynamic = false;
          config.log.debug( "mimosa watch called with minify, setting coffeescript.sourceMapDynamic to false to preserve source maps." );
        }
      }

      validators.ifExistsFileExcludeWithRegexAndStringWithField(
        errors,
        "coffeescript.sourceMapExclude",
        config.coffeescript,
        "sourceMapExclude",
        config.watch.javascriptDir );
    }
  }

  return errors;
};
