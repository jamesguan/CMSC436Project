//require('./lib/http');

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.014390, lng: -76.177689},
    zoom: 8
  });
}
