var express = require('express')
    , app = express()
    , serveStatic = require('serve-static'),
    d3 = require('d3'),
    healthData = require('../data/Sheet0.json'),
    chesapeakeData = require('../data/CEDR_2015_tidal_5params_jwolf_12jul16.json'),
    habitatData = require('../data/Habitat_Requirements.json'),
    _ = require("underscore")
    ;

app.get('/favicon.ico', function (req, res) {
    res.statusCode = 404;
    res.end();
});

var response = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Request-Method': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'image/svg+xml'
    },
    status: 200
};

var in_format = d3.time.format("%m/%d/%Y");

chesapeakeData.forEach(function(d) {
    try {
        var a = in_format.parse(d.Sample_Date);
        //console.log(a);
        d.Sample_Date = a;
    } catch (e) {
        console.log("error");
        // d.Sample_Date = in_format.parse('4/5/15');
    }

});

app.post('/getMapData', function (req, res) {
    req.on('data', function (chunk) {
        var dataByStation = _.groupBy(chesapeakeData, function (d) {
            return d.Station;
        })

        var stationData = [];
        var i= 0,j =0;
        _.each(dataByStation, function (data, index) {
            var station= {};
            station.wTempS = 0;
            station.wTempB = 0;
            station.salinityS = 0;
            station.salinityB = 0;
            station.secchi = 0;
            station.CHLA = 0;
            var dataByParams = _.groupBy(data, function (d) {
                return d.Parameter;
            })

            var wTempData = dataByParams['WTEMP'];

            _.each(wTempData, function (d, ind) {
                if (d.Layer == 'S ') {
                    i++;
                    station.wTempS+= parseFloat(d.MeasureValue);
                } else if (d.Layer == 'B ') {
                    j++;
                    station.wTempB+= parseFloat(d.MeasureValue);
                }
            });
            station.wTempS = parseFloat((station.wTempS/i) || 0);
            station.wTempB = parseFloat((station.wTempB/j) || 0);
            i=0;j=0;

            var salinityData = dataByParams['SALINITY'];

            _.each(salinityData, function (d, ind) {
                if (d.Layer == 'S ') {
                    i++;
                    station.salinityS+= parseFloat(d.MeasureValue);
                } else if (d.Layer == 'B ') {
                    j++;
                    station.salinityB+= parseFloat(d.MeasureValue);
                }
            });
            station.salinityS = parseFloat((station.salinityS/i) || 0);
            station.salinityB = parseFloat((station.salinityB/j) || 0);
            i=0;j=0;

            var secchiData = dataByParams['SECCHI'];

            _.each(secchiData, function (d, ind) {
                i++;
                    station.secchi+= parseFloat(d.MeasureValue);
            });
            station.secchi = parseFloat((station.secchi/i) || 0);
            i=0;j=0;

            var CHLAData = dataByParams['CHLA'];

            _.each(CHLAData, function (d, ind) {
                i++;
                station.CHLA+= parseFloat(d.MeasureValue);
            });
            station.CHLA = parseFloat((station.CHLA/i) || 0);
            i=0;j=0;

            station.depth = parseFloat(data[0].TotalDepth);
            station.id = data[0].Station;
            station.lat = data[0].Latitude;
            station.long = data[0].Longitude;
            stationData.push(station);
        })

        res.writeHead(response.status, response.headers);
        res.end(JSON.stringify(maxValuesForStationData(stationData)));
    })
});

function maxValuesForStationData(stationData) {
    var maxSecchi=0, maxCHLA=0, maxWTEMPS=0, maxWTEMPB=0, maxSalinityS=0, maxSalinityB=0, maxDepth =0;
    _.each(stationData, function (d) {
        if (d.CHLA > maxCHLA) {
            maxCHLA = d.CHLA;
        }
        if (d.secchi > maxSecchi) {
            maxSecchi = d.secchi;
        }
        if (d.wTempS > maxWTEMPS) {
            maxWTEMPS = d.wTempS;
        }
        if (d.wTempB > maxSecchi) {
            maxWTEMPB = d.wTempB;
        }
        if (d.salinityS > maxSalinityS) {
            maxSalinityS = d.salinityS;
        }
        if (d.salinityB > maxSalinityB) {
            maxSalinityB = d.salinityB;
        }
        if (d.depth > maxDepth) {
            maxDepth = d.depth;
        }
    })
    var finalData = {};
    finalData.stationData = stationData;
    finalData.maxWTempS = maxWTEMPS.toFixed(2);
    finalData.maxWTempB = maxWTEMPB.toFixed(2);
    finalData.maxSalinityS = maxSalinityS.toFixed(2);
    finalData.maxSalinityB = maxSalinityB.toFixed(2);
    finalData.maxSecchi = maxSecchi.toFixed(2);
    finalData.maxCHLA = maxCHLA.toFixed(2);
    finalData.maxDepth = maxDepth.toFixed(2);

    return finalData;
}

app.post('/getData', function (req, res) {
    req.on('data', function (chunk) {

        var in_format = d3.time.format("%m/%d/%Y");
        var content = JSON.parse(chunk.toString());

        var from = in_format.parse(content.data.to);
        var to = in_format.parse(content.data.from);
        var dataInDateRange = _.filter(chesapeakeData, function(cd) {
            return cd.Sample_Date >= from && cd.Sample_Date <= to ;
        });

        res.writeHead(response.status, response.headers);
        var dataGroupStations = d3.nest()
            .key(function (d) {
                return d.Station;
            })
            .entries(dataInDateRange);
        var stationData = _.find(dataGroupStations, function(d) {return d.key == content.data.stationId}).values;

        var depthArr = _.pluck(stationData, 'TotalDepth');
        var maxDepth = _.max(depthArr);
        var dataByParameters = _.groupBy(stationData, function (sd) {
            return sd.Parameter;
        });

        var scatter = false;

        if (content.data.chartType == 'scatter') {
            scatter = true;
        }

        var finaldata = {};
        finaldata.CHLAData = createData(dataByParameters, 'CHLA', scatter);
        finaldata.DO = createData(dataByParameters, 'DO', scatter);
        finaldata.WTEMP = createData(dataByParameters, 'WTEMP', scatter);
        //finaldata.SECCHI = createData(dataByParameters, 'SECCHI');
        finaldata.SALINITY = createData(dataByParameters, 'SALINITY', scatter);
        finaldata.maxDepth = maxDepth;
        finaldata.habitatData = habitatData;

        res.end(JSON.stringify(finaldata));
    });
});

function createData (dataByParameters, param, scatter) {
    var  groupedData = _.groupBy(dataByParameters[param], function (sd) {
        return sd.Depth;
    });
    var cd = {};
    var arr = [];
    var keys = _.sortBy(_.keys(groupedData), function (d) {
        return parseFloat(d);
    });
    var max =0;

    if (scatter) {
        keys.forEach( function (key) {
            groupedData[key].forEach( function (gd) {
            var obj = {};
            obj.y = gd.Depth;
            obj.x =gd.MeasureValue;
            arr.push(obj);
            if (parseFloat(gd.MeasureValue) > max) {
                max = parseFloat(gd.MeasureValue);
            }
        })});
    } else {
        keys.forEach( function (key) {
            var obj = {};
            var a =  _.reduce(groupedData[key], function(memo, num){
                    if (parseFloat(num.MeasureValue) > max) {
                        max = parseFloat(num.MeasureValue);
                    }
                    return memo + parseFloat(num.MeasureValue);
                }, 0)/groupedData[key].length;
            obj.y = key;
            obj.x =a.toFixed(2);
            arr.push(obj);
        })
    }

    cd.vals = arr;
    cd.max = max.toFixed(2);
    return cd;
}

/*
app.use(serveStatic('views', {'index': ['example.html']}));
*/

app.use(serveStatic('public'));


var server = app.listen(1337, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
