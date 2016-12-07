//require('./lib/http');
var map;
var image;
var shape;
var gotData = false;
var chesapeakeBay = {lat: 38.014390, lng: -76.177689}
//var sortedData;
var markers = [];

var kml = {
  Salinity: {
    name: "Salinity",
    url: "https://dl.dropbox.com/s/6tr7uczhj2zqnwc/salinity.kmz"
  }

};

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
  //var sortedData = raw_data.sort(compareStation);

  // Call function to plot the stations using the data
  //plotStations(map, sortedData);

  //sortedData = null;
  //raw_data = null;
  //drawScale();
});

function createButton(text){
  var controlUI = document.createElement('div');

  controlUI.style.backgroundColor = '#fff';
  controlUI.style.marginLeft = '1%';
  controlUI.style.marginRight = '1%';
  controlUI.style.width = '10%';
  controlUI.style.paddingLeft = '5%';
  controlUI.style.paddingRight = '5%';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.display = "inline-block";
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlUI.style.color = 'rgb(25,25,25)';
  controlUI.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlUI.style.fontSize = '12px';
  controlUI.style.lineHeight = '22px';
  controlUI.style.paddingLeft = '5px';
  controlUI.style.paddingRight = '5px';
  controlUI.innerHTML = text;
  // Set CSS for the control interior.
  return controlUI;
}

function createDropdown(text){
  dropDownUI = document.getElementById("speciesSelection");
  //dropDownUI.style.position = 'relative';
  dropDownUI.style.display = 'inline-block';
  console.log(document.getElementsByClassName("dropdown-content"));
  //.style.display = 'none';
  return dropDownUI;
/*
  .dropdown-content {
      display: none;
      position: absolute;

      width: 100px;

  }
  */
  /*var controlUI = document.getElementById("speciesSelection");
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  //controlUI.title = 'Click to recenter the map';

  controlUI.style.color = 'rgb(25,25,25)';
  controlUI.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlUI.style.fontSize = '12px';
  controlUI.style.lineHeight = '20px';
  controlUI.style.paddingLeft = '5px';
  controlUI.style.paddingRight = '5px';
  controlUI.innerHTML = text;
  return controlUI;
  */
}

function Controls(buttonBarDiv, map){
  // Set CSS for the control border.

        //controlUI.float = 'right';
        var recenterButton = createButton("Recenter");
        var salinityButton = createButton("Salinity");
        var dropDown = createDropdown("Species");
        buttonBarDiv.style.display = 'inline';

        buttonBarDiv.appendChild(salinityButton);
        buttonBarDiv.appendChild(recenterButton);
        buttonBarDiv.appendChild(dropDown);


        /*
        var salinityLayer = new google.maps.FusionTablesLayer({
          url: "https://dl.dropbox.com/s/6tr7uczhj2zqnwc/salinity.kmz"

        });
        */

        // Setup the click event listeners: simply set the map to Chicago.
        recenterButton.addEventListener('click', function() {
          map.setCenter(chesapeakeBay);
        });

        salinityButton.addEventListener('click', function() {
          if (kml.Salinity.obj == null){
            kml.Salinity.obj = new google.maps.KmlLayer(kml.Salinity.url, {
              //suppressInfoWindows: true,
              //preserveViewport: false,
              map: map
            });
          }
          else {
            kml.Salinity.obj.setMap(null);
            delete kml.Salinity.obj;
          }
        });

        document.getElementById("salinity").addEventListener('click', function() {
          map.setCenter(chesapeakeBay);
        });

        //dropDown.onmouseover=function(){document.getElementById("speciesSelection").classList.toggle("show");}

        /*
        google.maps.event.addListener(salinityLayer, 'click', function(event) {
          var content = event.featureData.infoWindowHtml;
          var testimonial = document.getElementById('capture');
          testimonial.innerHTML = content;
        });
        */

}

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

  var buttonBarDiv = document.getElementById("bar");
  var controls = new Controls(buttonBarDiv, map);

  buttonBarDiv.index = 1;
  buttonBarDiv.style['padding-top'] ='10px';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(buttonBarDiv);


}
