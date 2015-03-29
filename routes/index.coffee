utils = require './utils'

index = (config) ->
  return (req, res) ->
    res.render "index", utils.getContext(config)

exports.index = index
exports.cv = require './cv'
