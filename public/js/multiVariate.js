function getQuantity(quant) {
    var q = $("#quantities").val();
    if (q.length >0) {
        $("#scatter").empty();
        $("#legend").empty();
        $("#resizeBox").empty();
        $("#map").hide();
        $("#container").hide();
        if (q.length > 1) {
            quantitySelected = q.join(",");
            createMultiViz(q);
        } else {
            quantitySelected = q[0];
            createViz(dataStore, quantitySelected);
        }
        $("#scatterDiv").show();
    }

}

function createMultiViz(q) {
    var qmin =  Number.MAX_SAFE_INTEGER; var qmax =0;
    var data = dataStore;
    q.forEach(function (i) {
        var min = d3.min(data, function (d) {
            return parseInt(d[i]);
        })
        if (min < qmin) {
            qmin = min;
        }

        var max = d3.max(data, function (d) {
            return parseInt(d[i]);
        })
        if (max > qmax) {
            qmax = max;
        }
    })
    var obj = {};
    obj.qs = q;
    obj.min = qmin;
    obj.max = qmax;
    obj.marginRight = 2*selectedWidth +5;
    obj.marginBottom = Math.ceil(q.length/2) * selectedHeight + (Math.ceil(q.length/2)-1) * 5;
    createViz(data, obj, true);
}

function drawMeanMVCC(data, g, x, y, obj) {
    var bDYoung= {};var bDAdult={};
    bDYoung["Choline"] = [];
    bDAdult["Choline"] = [];
    bDYoung["Creatine"] = [];
    bDAdult["Creatine"] = [];
    bDYoung["Glx"] = [];
    bDAdult["Glx"] = [];
    bDYoung["Inositol"] = [];
    bDAdult["Inositol"] = [];
    bDYoung["NAA"] = [];
    bDAdult["NAA"] = [];
    data["Age"].forEach(function (item, i) {
        if (parseInt(item.Age) <=18) {
            bDYoung["Choline"].push(data["Choline"][i]);
            bDYoung["Creatine"].push(data["Choline"][i]);
            bDYoung["Glx"].push(data["Choline"][i]);
            bDYoung["Inositol"].push(data["Choline"][i]);
            bDYoung["NAA"].push(data["Choline"][i]);

        } else {
            bDAdult["Choline"].push(data["Choline"][i]);
            bDAdult["Creatine"].push(data["Choline"][i]);
            bDAdult["Glx"].push(data["Choline"][i]);
            bDAdult["Inositol"].push(data["Choline"][i]);
            bDAdult["NAA"].push(data["Choline"][i]);
        }
    });
    dsYoungMetas = calculateMeanForBrainData(bDYoung);
    dsAdultMetas = calculateMeanForBrainData(bDAdult);
}

function calculateMeanForBrainData(data) {
    var regionMetas = [];
    for (br=0; br<brainRegions.length; br++) {
        var region = brainIndexes[brainRegions[br].index].replace("_", " ");
        var obj = {};
        obj.index = brainRegions[br].index;
        obj.region = region;
        var metaDetails = {};
        Object.keys(data).forEach(function (item, i) {
            metaDetails[item] = minMaxMean(_.pluck(data[item], region));
        });
        obj.metaDetails = metaDetails;
        regionMetas.push(obj);
    }
    return regionMetas;
}

function minMaxMean(arr) {
    var obj = {}; var c=0;
    var min = Number.MAX_VALUE;
    var max = 0;
    var sum = 0;
    arr.forEach(function (item, i) {
        var val = parseFloat(item);
        if (val) {
            if (val < min) {
                min = val
            }
            if (val > max) {
                max = val;
            }
            sum += val;
            c++;
        }
    });
    obj.min = min;
    obj.max = max;
    obj.mean = sum/c;
    return obj;
}

function drawMVCC(data, g, x, y, obj) {
    if (obj.min < 1) {
        scaleValues(min);
    }

    var normMax = normalizeExtremes(obj.max);
    var ratio = calculateScalingRatio(normMax);
    var groups = legendGroup();

    drawLegend();

    data.forEach(function (item) {
        var pointData = {};
        var plotData = [];
        var maxW=0;  var maxH=0;
        obj.qs.forEach(function (col) {
            var plots = {};
            plots.dmnsn = getDimensions(item[col], groups, ratio);
            plotData.push(plots);
            if (plots.dmnsn.width > maxW ) {
                maxW = plots.dmnsn.width;
            }
            if (plots.dmnsn.height > maxH ) {
                maxH = plots.dmnsn.height;
            }
        });
        pointData.points = plotData;
        pointData.maxW = maxW;
        pointData.maxH = maxH;
        var posX = x(item.x);
        var posY = y(item.y);
        drawMVCCPoints(pointData, g, posX, posY, obj.qs, item)
    });
    $("#legendDiv").show();
    $("#scatter").show();
}

function drawMVCCPoints(pointData, g, x, y, cols) {
    var startX = x; var startY = y;
    var maxW = pointData.maxW;
    var maxH = pointData.maxH;
    var maxLW = maxLeftWidth(pointData);
    for (i=0; i < cols.length; i = i+2) {
        var point = pointData.points[i].dmnsn; var h1 = point.height;
        drawMVRects(point.width, point.height, g, x+ maxLW-point.width, y + maxH-point.height, i);
        point = pointData.points[i+1].dmnsn; var h2 = point.height;
        drawMVRects(point.width, point.height, g, x+ maxLW + 6, y + maxH-point.height, i+1);
        if (i > 0) {
            drawMVLine(g, x, y-2, x + 2*maxW + 5, y-2)
        }
        if (h1> h2) {
            y += h1 + 5;
        } else {
            y += h2 + 5;
        }
    }
    drawMVLine(g, x + maxLW +3, startY, x + maxLW +3, y -5);
}

function maxLeftWidth(points) {
    var max=0;
    for (i=0; i< points.length; i=i+2) {
        if (points[i].dmnsn.height > max) {
            max = points[i].dmnsn.height;
        }
    }
    return max;
}

function drawMVRects(w, h, g, x, y, i) {
    var s = g.append("svg");
    var t = texture[i];
    //var t = textures.lines().thicker();
    s.call(t);
    s.append("rect").
    attr("x", x ).
    attr("y", y ).
    attr("width", w).
    attr("stroke", '#f5f5f5').
    attr("fill", t.url()).
    /*attr("fill", markerFillClr).*/
    attr("fill-opacity", 1).
    attr("stroke-width", '.4').
    attr("stroke-opacity", '.5').
    attr("height", h)
}

function drawMVLine(g, x1, y1, x2, y2) {
    g.append("line")
        .style("stroke", "blue")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
}