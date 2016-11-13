//require('./lib/http');



var map;
var image;
var shape;
var gotData = false;
var sortedData;

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

function plotStations(map, data){
  console.log(data);
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
    alert(curr.Latitude);
    alert(curr.Longitude);
  }

  for (var i = 1; i < data.length; i++){
    curr = data[i];
    if (curr.Station != prev.Station){
      var marker = new google.maps.Marker({
            position: {lat: parseFloat(curr.Latitude), lng: parseFloat(curr.Longitude)},
            map: map,
            icon: image,
            shape: shape,
            title: curr.Station,
            zIndex: i
      });
      prev = curr;
    }
  }
}

d3.csv("cedr.csv", function(error, raw_data){
  if(error) throw error;

  sortedData = raw_data.sort(compareStation);
  //gotData = true;
  //sortedData = raw_data;
  plotStations(map, sortedData);

});

function initMap(){

  // I want to do something here after async function
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.014390, lng: -76.177689},
    zoom: 8
  });

  image = {
          url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
          // This marker is 20 pixels wide by 32 pixels high.
          size: new google.maps.Size(20, 32),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(0, 32)
  };

  shape = {
          coords: [1, 1, 1, 20, 18, 20, 18, 1],
          type: 'poly'
  };

}
