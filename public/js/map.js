//require('./lib/http');



var map;
var image;
var shape;
var gotData = false;
var sortedData;
var markers = [];

function compareMeasureValue(a,b){
  if (a.MeasureValue < b.MeasureValue){
    return -1;
  }
  if (a.MeasureValue > b.MeasureValue){
    return 1;
  }
  return 0;
}

function compareParameter(a,b){
  if(a.Parameter < b.Parameter){
    return -1;
  }
  if(a.Parameter > b.Parameter){
    return 1;
  }
  return compareMeasureValue(a,b);
}

function compareDepth(a,b){
  if(a.Depth < b.Depth){
    return -1;
  }
  if(a.Depth > b.Depth){
    return 1;
  }
  return compareParameter(a,b);
}

function compareStation(a,b){
  if(a.Station < b.Station){
    return -1;
  }
  if(a.Station > b.Station){
    return 1;
  }
  return compareDepth(a,b);
}


function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function addMarkerWithTimeout(position, timeout) {
        window.setTimeout(function() {
          markers.push(new google.maps.Marker({
            position: position,
            map: map,
            animation: google.maps.Animation.DROP
          }));
        }, timeout);
      }

function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        markers = [];
}

function rgb(r, g, b){
  if(r > 255){
    r = 255;
  }
  if(g > 255){
    g = 255;
  }
  if(b > 255){
    b = 255;
  }

  if(r < 0){
    r = 0;
  }
  if(g < 0){
    g = 0;
  }
  if(b < 0){
    b = 0;
  }
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  return ["rgb(",r,",",g,",",b,")"].join("");
}

function plotStations(map, data){
  //console.log(data);
  var prev;
  var curr;
  if (data.length > 1){
    prev = data[0];
    curr = data[1];
    var marker = new google.maps.Marker({
          position: {lat: parseFloat(curr.Latitude), lng: parseFloat(curr.Longitude)},
          map: map,
          icon: image,
          shape: shape,
          title: curr.Station,
          zIndex: 0
    });
  }

  for (var i = 1; i < data.length; i++){
    curr = data[i];
    if (curr.Station != prev.Station){
      var marker = new google.maps.Marker({
            position: {lat: parseFloat(curr.Latitude), lng: parseFloat(curr.Longitude)},
            map: map,
            //icon: image,
            icon: {
                    /*
                    url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                    // This marker is 20 pixels wide by 32 pixels high.
                    size: new google.maps.Size(20, 32),
                    // The origin for this image is (0, 0).
                    origin: new google.maps.Point(0, 0),
                    // The anchor for this image is the base of the flagpole at (0, 32).
                    anchor: new google.maps.Point(0, 32)
                    */
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8.5,
                    fillColor: rgb(0, 255 - (curr.TotalDepth * 6), 255),
                    fillOpacity: 0.4,
                    strokeWeight: 0.4
            },
            shape: shape,
            title: curr.Station,
            zIndex: i
      });
        marker.addListener('click', function() {
            createViz(this.title);
        });
      markers.push(marker);
      //marker.addListener('click', toggleBounce);
      prev = curr;
    }
  }
}

d3.csv("cedr.csv", function(error, raw_data){
  if(error) throw error;

  sortedData = raw_data.sort(compareStation);
  plotStations(map, sortedData);

});

function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.014390, lng: -76.177689},
    zoom: 8
  });

  image = {
          /*
          url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
          // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(20, 32),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(0, 32)
          */
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8.5,
          fillColor: "#0000FF",
          fillOpacity: 0.6,
          strokeWeight: 0.4
  };

  shape = {
          coords: [1, 1, 1, 20, 18, 20, 18, 1],
          type: 'poly'
  };

}
