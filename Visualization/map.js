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

    
// Use this function to clear the markers from the array/map
function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
        markers = [];
}

function loadKML(src, map) {
  var kmlLayer = new google.maps.KmlLayer(src, {
    //suppressInfoWindows: true,
    //preserveViewport: false,
    map: map
  });
  google.maps.event.addListener(kmlLayer, 'click', function(event) {
    var content = event.featureData.infoWindowHtml;
    var overlay = document.getElementById('overlay');
    overlay.innerHTML = content;
  });
  
  //console.log("KML");
}


/*
 * This function returns the string for rgb values
 */
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

// This function will plot all the data and store the markers into a global array
// Beware that the function is async
function plotStations(map, data){
  var prev;
  var curr;
  if (data.length > 1){
    prev = data[0];
    curr = data[1];
    var marker = new google.maps.Marker({
      position: {lat: parseFloat(curr.Latitude), lng: parseFloat(curr.Longitude)},
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8.5,
        fillColor: rgb(0, 240 - (curr.TotalDepth * 4), 215 + curr.TotalDepth),
        fillOpacity: 0.6,
        strokeWeight: 0.4
      },
      shape: shape,
      title: curr.Station,      
      zIndex: 0,
      animation: google.maps.Animation.DROP
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
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8.5,
          fillColor: rgb(0, 240 - (curr.TotalDepth * 4),  215 + curr.TotalDepth),
          fillOpacity: 0.6,
          strokeWeight: 0.4
        },
        shape: shape,
        title: "Station: " + curr.Station + " TotalDepth: " + curr.TotalDepth,
        zIndex: i
      });
      markers.push(marker);
      //marker.addListener('click', toggleBounce);
      prev = curr;
    }
  }
}

// Read in the data to grab the longitude and latitude for the map
d3.csv("cedr.csv", function(error, raw_data){
  if(error) throw error;
  
  // Sort the data for easier use
  sortedData = raw_data.sort(compareStation);
  
  // Call function to plot the stations using the data
  plotStations(map, sortedData);
  drawScale();
});

// This is called to initialize the map
function initMap(){
  
  // Latitude coordinates are set to center or chesapeake bay
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.014390, lng: -76.177689},
    zoom: 8
  });

  image = {
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
  
  loadKML("https://jamesguan.github.io/Public/doc.kml", map);
}
