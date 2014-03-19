moment = require 'moment'

birthDate = '1985-10-26'

cv = (config) ->

  options =
    reload:    config.liveReload.enabled
    optimize:  config.isOptimize ? false
    cachebust: if process.env.NODE_ENV isnt "production" then "?b=#{(new Date()).getTime()}" else ''

    age: moment().diff(birthDate, 'years')

  (req, res) -> res.render "cv", options

module.exports = cv
