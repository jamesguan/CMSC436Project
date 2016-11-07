var express = require('express')
    , app = express()
    , serveStatic = require('serve-static'),
    healthData = require('../data/Sheet0.json')
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
