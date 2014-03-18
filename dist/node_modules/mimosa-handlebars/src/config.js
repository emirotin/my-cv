"use strict";

exports.defaults = function() {
  return {
    handlebars: {
      extensions: ["hbs", "handlebars"],
      helpers:["app/template/handlebars-helpers"]
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n" +
         "  handlebars:              # config settings for the Handlebars compiler module\n" +
         "    lib: undefined         # use this property to provide a specific version of Handlebars\n" +
         "    extensions: [\"hbs\", \"handlebars\"]  # default extensions for Handlebars files\n" +
         "    helpers:[\"app/template/handlebars-helpers\"]  # the paths from watch.javascriptDir to\n" +
         "                           # the files containing handlebars helper/partial registrations\n";
};

exports.validate = function( config, validators ) {
  var errors = [];

  if ( validators.ifExistsIsObject( errors, "handlebars config", config.handlebars ) ) {

    if ( !config.handlebars.lib ) {
      config.handlebars.lib = require( "handlebars" );
    }

    if ( validators.isArrayOfStringsMustExist( errors, "handlebars.extensions", config.handlebars.extensions ) ) {
      if (config.handlebars.extensions.length === 0) {
        errors.push( "handlebars.extensions cannot be an empty array");
      }
    }

    validators.ifExistsIsArrayOfStrings( errors, "handlebars.helpers", config.handlebars.helpers );

  }

  return errors;
};
