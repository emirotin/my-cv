exports.getContext = (config) ->
  return {
    reload: config.liveReload.enabled
    optimize: config.isOptimize ? false
    cachebust: if process.env.NODE_ENV isnt "production" then "?b=#{(new Date()).getTime()}" else ''
  }
