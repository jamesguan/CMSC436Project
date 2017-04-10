//require('./lib/http');
var map;
var image;
var shape;
var gotData = false;
//var sortedData;
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
        suppressInfoWindows: true,
        preserveViewport: true,
        map: map
    });
    google.maps.event.addListener(kmlLayer, 'click', function(event) {
        var content = event.featureData.infoWindowHtml;
        var overlay = document.getElementById('overlay');
        overlay.innerHTML = content;
    });
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
                title: curr.Station ,
                zIndex: i
            });
            //marker.addListener('click', toggleBounce);
            marker.addListener('click', function() {
                createViz(this.title);
            });
            markers.push(marker);
            prev = curr;
        }
    }
}

function initMap1() {
    
}

function initMap() {
    String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
    };

    var mapData = {};
    var data = $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:1337/getMapData',
        data: JSON.stringify({
            data: undefined
        }),
        dataType: 'json',
        async: false,
        success: function (data) {
            mapData = data
        }
    });

    var myLatlng = new google.maps.LatLng(38.014390,-76.177689);
    var mapOptions = {
        zoom: 9,
        center: myLatlng,
        disableDefaultUI: true,
		mapTypeId: 'terrain'
    }

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	
	var mapStyle = [
	  {
		featureType: "all",
		stylers: [
		  { visibility: "off" }
		]
	  },{
		featureType: "administrative",
		stylers: [
		  { visibility: "on" }
		]
	  }
	];
	
	map.setOptions({styles: mapStyle});

    initializeCustomMapMarker();

    mapData.stationData.forEach( function(d, index) {
        var latlng = new google.maps.LatLng(d.lat,d.long);
        overlay = new CustomMarker(
            latlng,
            map,
            {
                marker_id: d.id.replaceAll(".", "-"),
                mapData : mapData
            }
        );
    });


    google.maps.event.addListenerOnce(map, 'idle', function(){
        mapData.stationData.forEach( function(d, index) {
            //createGlyph(d.id.replaceAll(".", "-"), mapData, d);
            createCCGlyphs(d.id.replaceAll(".", "-"), mapData, d);
        });
        //loadKML("https://dl.dropbox.com/s/6tr7uczhj2zqnwc/salinity.kmz", map);
    });

    /*var buttonBarDiv = document.getElementById("bar");
    var controls = new Controls(buttonBarDiv, map);

    buttonBarDiv.index = 1;
    buttonBarDiv.style['padding-top'] ='10px';
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(buttonBarDiv);*/

}




//James changes
var chesapeakeBay = {lat: 38.014390, lng: -76.177689}
var kml = [
    {
        name: "Salinity",
        url: "https://dl.dropbox.com/s/6tr7uczhj2zqnwc/salinity.kmz"
    }
];

var speciesKML = [
    {
        name: "Alewife",
        url: "https://dl.dropbox.com/s/dbe9rdp0vsdjats/alewife.kmz"
    },
    {
        name: "American Shad",
        url: "https://dl.dropbox.com/s/h7dch8bm769cc6s/american_shad.kmz"
    },
    {
        name: "Anchovy Adult",
        url: "https://dl.dropbox.com/s/adbcq3yjkl4b06d/anchovy_adult.kmz"
    },
    {
        name: "Anchovy Juvenile",
        url: "https://dl.dropbox.com/s/lypo0elsepfsu65/anchovy_juvenile.kmz"
    },
    {
        name: "Blue Crab",
        url: "https://dl.dropbox.com/s/x8nx5ma4mpfbj3p/blue_crab.kmz"
    },
    {
        name: "Blueback Herring",
        url: "https://dl.dropbox.com/s/vcyj8dqejcwy5w6/blueback_herring.kmz"
    },
    {
        name: "Hard Clam",
        url: "https://dl.dropbox.com/s/nuktib8eqgbrgd7/hard_clam.kmz"
    },
    {
        name: "Menhaden Adult",
        url: "https://dl.dropbox.com/s/lwio0ntqw8xt12p/menhaden_adult.kmz"
    },
    {
        name: "Menhaden Juvenile",
        url: "https://dl.dropbox.com/s/vhdl6pl1mukciok/menhaden_juvenile.kmz"
    },
    {
        name: "Oyster",
        url: "https://dl.dropbox.com/s/ul3cxcdzmylu0sk/oyster.kmz"
    },
    {
        name: "Softshell Clam",
        url: "https://dl.dropbox.com/s/rd253d1i6p968ea/soft_shell_clam.kmz"
    },
    {
        name: "Spot",
        url: "https://dl.dropbox.com/s/dgqoqumhwhb2azp/spot.kmz"
    },
    {
        name: "Striped Bass",
        url: "https://dl.dropbox.com/s/ka0veqseefmh76z/striped_bass.kmz"
    },
    {
        name: "White Perch",
        url: "https://dl.dropbox.com/s/n7i2qza0xqdcysm/white_perch.kmz"
    },
    {
        name: "Yellow Perch",
        url: "https://dl.dropbox.com/s/v1qdawqtyya1lyl/yellow_perch.kmz"
    }
];

function createButton(className, id, text, title){
    var controlUI = document.createElement('div');
    controlUI.className = className;
    controlUI.id = id;
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
    controlUI.title = title;
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

function createDropDownButton(className, id, text, title){
    var controlUI = document.createElement('div');
    controlUI.className = className;
    controlUI.id = id;
    controlUI.innerHTML = text;
    //display: none;

    // Set CSS for the control interior.
    return controlUI;
}

function createDropdown(text){
    dropDownUI = document.getElementById("speciesSelection");
    //dropDownUI.style.position = 'relative';
    dropDownUI.style.display = 'inline-block';
    //console.log(document.getElementsByClassName("dropdown-content"));
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
    var recenterButton = createButton("mapButtons", "recenterButton", "Recenter", "Click to recenter to Chesapeake Bay");

    for (var i = 0; i < kml.length; i++){
        buttonBarDiv.appendChild(createButton("mapButtons", kml[i].name, kml[i].name, "Click for " + kml[i].name + " KML"));
    }

    //console.log(document.getElementById("Salinity"));
    var dropDown = createDropdown("Species");

    buttonBarDiv.style.display = 'inline';
    buttonBarDiv.appendChild(recenterButton);
    buttonBarDiv.appendChild(dropDown);

    var dropDownMenu = document.getElementById("speciesDropDown");

    for (var i = 0; i < speciesKML.length; i++){
        dropDownMenu.appendChild(createDropDownButton("speciesItem", speciesKML[i].name, speciesKML[i].name, "Click for " + speciesKML[i].name + " KML"));
    }

    // Setup the click event listeners: simply set the map to Chicago.
    recenterButton.addEventListener('click', function() {
        map.setCenter(chesapeakeBay);
    });

    var tempButton;
    var index;
    for (var t = 0; t < kml.length; t++){
        tempButton = document.getElementById(kml[t].name);
        index = t;
        if(typeof window.addEventListener === 'function'){
            (function (_tempButton, _index) {
                tempButton.addEventListener('click', function(){
                    //console.log(_tempButton);
                    //console.log("INDEX: " + _index);
                    if (kml[_index].obj == null){
                        kml[_index].obj = new google.maps.KmlLayer(kml[_index].url, {
                            //suppressInfoWindows: true,
                            //preserveViewport: false,
                            map: map
                        });
                    }
                    else {
                        kml[_index].obj.setMap(null);
                        delete kml[_index].obj;
                    }
                });
            })(tempButton, index);
        }
    }

    for (var t = 0; t < speciesKML.length; t++){
        tempButton = document.getElementById(speciesKML[t].name);
        index = t;
        if(typeof window.addEventListener === 'function'){
            (function (_tempButton, _index) {
                tempButton.addEventListener('click', function(){

                    if (speciesKML[_index].obj == null){
                        speciesKML[_index].obj = new google.maps.KmlLayer(speciesKML[_index].url, {
                            //suppressInfoWindows: true,
                            //preserveViewport: false,
                            map: map
                        });
                        _tempButton.style.backgroundColor = '#bbb';
                    }
                    else {
                        speciesKML[_index].obj.setMap(null);
                        delete speciesKML[_index].obj;
                        _tempButton.style.backgroundColor = '#fff';
                    }
                });
            })(tempButton, index);
        }
        if(typeof window.addEventListener === 'function'){
            (function (_tempButton, _index) {
                tempButton.addEventListener('mouseover', function(){
                    _tempButton.style.backgroundColor = '#999';
                });
            })(tempButton, index);
        }
        if(typeof window.addEventListener === 'function'){
            (function (_tempButton, _index) {
                tempButton.addEventListener('mouseout', function(){
                    if (speciesKML[_index].obj == null){
                        _tempButton.style.backgroundColor = '#fff';
                    }
                    else {
                        _tempButton.style.backgroundColor = '#bbb';
                    }
                });
            })(tempButton, index);
        }
    }
}
