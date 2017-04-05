$ = require('jquery')
require('bootstrap')

class CvView
  render: (element) ->
    @$el = $el = $ element

    pos =
      lat: 53.8838884
      lng: 27.5949741
      zoom: 4

    mapOptions =
      center: new google.maps.LatLng pos.lat, pos.lng
      zoom: pos.zoom
      mapTypeId: google.maps.MapTypeId.ROADMAP
    map = new google.maps.Map $el.find(".map-canvas")[0], mapOptions
    marker = new google.maps.Marker
      position: new google.maps.LatLng pos.lat, pos.lng
    marker.setMap map

    $el.find('#map-modal').on 'shown.bs.modal', ->
      google.maps.event.trigger map, "resize"
      map.setCenter new google.maps.LatLng pos.lat, pos.lng

module.exports = CvView
