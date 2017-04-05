_ = require 'lodash'
moment = require 'moment'
utils = require './utils'

birthDate = '1985-10-26'

cv = (config) ->

  options = _.extend utils.getContext(config),
    age: moment().diff(birthDate, 'years')
    MAPS_API_KEY: 'AIzaSyBXfayCu_fu5PMwBw45A_PcTU_b3KVndFw'

  return (req, res) ->
    res.render "cv", options

module.exports = cv
