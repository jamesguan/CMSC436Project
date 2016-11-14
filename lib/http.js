var express = require('express')
    , app = express()
    , serveStatic = require('serve-static'),
    d3 = require('d3'),
    healthData = require('../data/Sheet0.json'),
    chesapeakeData = require('../data/CEDR_2015_tidal_5params_jwolf_12jul16.json'),
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

app.post('/d3/:chartType.svg', function (req, res) {
    req.on('data', function (chunk) {
        var content = {};
        var output = "";

        try {
            // Validate request content as JSON
            content = JSON.parse(chunk.toString());
            output = require('./d3')(req.params.chartType, content.data);
        }
        catch (e) {
            // If not a valid JSON, returns an error 400
            response.headers['Content-Type'] = 'text/plain';
            response.status = 400;
            output = "400 Bad request " + e;
        }

        console.log(healthData[0].Age_Group);

        res.writeHead(response.status, response.headers);

        res.end(JSON.stringify(output));
    });
});

app.post('/getHealthData', function (req, res) {
    req.on('data', function (chunk) {

        res.writeHead(response.status, response.headers);

        res.end(JSON.stringify(healthData));
    });
});

app.post('/getData', function (req, res) {
    req.on('data', function (chunk) {

        var in_format = d3.time.format("%m/%d/%Y");

        var from = in_format.parse('1/5/15');
        var to = in_format.parse('4/5/15');
        var dataInDateRange = _.filter(chesapeakeData, function(cd) {
            return cd.Sample_Date >= from && cd.Sample_Date <= to ;
        });

        res.writeHead(response.status, response.headers);
        var dataGroupStations = d3.nest()
            .key(function (d) {
                return d.Station;
            })
            .entries(dataInDateRange);
        var stationData = _.find(dataGroupStations, function(d) {return d.key == "EE3.1"}).values;

        var depthArr = _.pluck(stationData, 'TotalDepth');
        var maxDepth = _.max(depthArr);
        var dataByParameters = _.groupBy(stationData, function (sd) {
            return sd.Parameter;
        });

        var finaldata = {};
        finaldata.CHLAData = createData(dataByParameters, 'CHLA');
        finaldata.DO = createData(dataByParameters, 'DO');
        finaldata.WTEMP = createData(dataByParameters, 'WTEMP');
        //finaldata.SECCHI = createData(dataByParameters, 'SECCHI');
        finaldata.SALINITY = createData(dataByParameters, 'SALINITY');
        finaldata.maxDepth = maxDepth;

        res.end(JSON.stringify(finaldata));
    });
});

function createData (dataByParameters, param) {
    var  groupedData = _.groupBy(dataByParameters[param], function (sd) {
        return sd.Depth;
    });
    var cd = {};
    var arr = [];
    var keys = _.sortBy(_.keys(groupedData), function (d) {
        return parseFloat(d);
    });
    var max =0;

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
    cd.vals = arr;
    cd.max = max.toFixed(2);
    return cd;
}

app.post('/fusion-charts/:chartType.svg', function (req, res) {
    req.on('data', function (chunk) {
        var content = {};
        var output = "";

        try {
            // Validate request content as JSON
            content = JSON.parse(chunk.toString());
            require('./fusion-charts')(req.params.chartType, content.data).then(function (xml) {
                res.writeHead(response.status, response.headers);

                res.end(JSON.stringify(xml));
            });
        }
        catch (e) {
            // If not a valid JSON, returns an error 400
            response.headers['Content-Type'] = 'text/plain';
            response.status = 400;
            output = "400 Bad request " + e;

            res.writeHead(response.status, response.headers);

            res.end(JSON.stringify(output));
        }
    });
});

app.use(serveStatic('views', {'index': ['example.html']}));

var server = app.listen(1337, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});
