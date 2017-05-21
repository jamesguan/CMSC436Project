function getQuantity(quant) {
    var q = $("#quantities").val();
    if (q.length >0) {
        $("#scatter").empty();
        $("#legend").empty();
        $("#resizeBox").empty();
        $("#map").hide();
        $("#container").hide();
       /* if (q.length > 1) {
            quantitySelected = q.join(",");
            createMultiViz(q);
        } else {
            quantitySelected = q[0];
            createViz(dataStore, quantitySelected);
        }*/
       maxMagnitudeBD = 0;
        drawMeanMVCC(brainData, q);
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

function drawMeanMVCC(data, cols) {
    var bDYoung= {};var bDAdult={};var maxChemicalValues = {};
    var max = 0; var min = 200;
    cols.forEach(function (col, c) {
        var obj = {};
        obj.ymax =0;
        obj.amax =0;
        maxChemicalValues[col] = obj;
        bDYoung[col] = [];
        bDAdult[col] = [];
        data["Age"].forEach(function (item, i) {
            if (item.Age < min) {
                min = item.Age
            }
            if (item.Age > max) {
                max = item.Age
            }
            if (parseInt(item.Age) <=ageSelected) {
                bDYoung[col].push(data[col][i]);
            } else {
                bDAdult[col].push(data[col][i]);
            }
        });
    })

    initiateAgeSlider(min, max)
    initiatePlaneSlider(27, 180)
    d3.csv("/views/sliceIndexes/"+ cutPlaneSelected+".csv", function(indexData) {
        brainRegions = indexData;
        dsYoungMetas = calculateMeanForBrainData(bDYoung);
        dsAdultMetas = calculateMeanForBrainData(bDAdult);
        drawBrainMeta(cols, maxChemicalValues);
        finalShow("mv");
    })

    $("#scatter").css("background-color", "#ffffff")

}

function drawBrainMeta(cols, maxChemicalValues) {

    var svg = d3.select("#scatter").attr("height", brHeight)/*.call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    }))*/.append("g");

    /*var margin = {top: 5, right: 5, bottom: 0, left: 25},
        width = $("#scatterDiv").width(),
        height = brHeight,
        domainwidth = width - margin.left - margin.right,
        domainheight = height - margin.top - margin.bottom;*/

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = brWidth;

    var ratio = brHeight/180;
    var ceilRatio = Math.ceil(ratio);

    var topLeft = (width/2) - ratio*80;
    var topLeftGlyph = (width/2) - 10*mvBarWidth;
    var diff = topLeft - topLeftGlyph;

    var height = brHeight,
        domainwidth = ratio * 160,
        domainheight = brHeight;



    var g = svg.append("g")
        .attr("transform", "translate(" + topLeft + "," + 0 + ")");
    /*var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/
    /*var x = d3.scaleLinear()
        .domain([0, d3.max(brainRegions, function (d) {
            return parseInt(d.x);
        })+5])
        .range([0, domainwidth]);
    var y = d3.scaleLinear()
        .domain([0, d3.max(brainRegions, function (d) {
            return parseInt(d.y);
        })+10])
        .range([domainheight-25, 0]);*/

    var x = d3.scaleLinear()
        .domain([10,170])
        .range([0, domainwidth]); // changed from 0 to topLeft
    var y = d3.scaleLinear()
        .domain([15, 205])
        .range([0, domainheight]); // changed from 25 to 0
    var separatorPos = x(90);


    var grid = [];
    for(i=1; i<=120; i++) {
        grid[i] = true;
    }


    var s = g.append("svg");
    /*s.append("svg:path")
        .attr("d","M " + separatorPos+ " 0 L " + separatorPos + " " + domainheight)
        .style("stroke-width", 1)
        .style("stroke", 'red')
        .style("stroke-opacity", '1');*/

    var valScale = d3.scaleLinear()
        .domain([0, maxMagnitudeBD])
        .range([0, mvBarWidth]);

    var pixelInfo = [];
    d3.csv("/views/slices/"+cutPlaneSelected+".csv", function(data) {
        var k=0,l=0;
        var arr = [];
        for (i=0; i<data.length; i++) {
            arr[k++] = data[i].index;
            if (k==181) {
                pixelInfo[l++] = arr;
                k=0;arr=[];
            }
        }
        for (i=1; i<216; i++) {
            for (j=1; j<180; j++) {
                if (!((pixelInfo[i][j] == pixelInfo[i-1][j])
                    && (pixelInfo[i][j] == pixelInfo[i+1][j])
                    && (pixelInfo[i][j] == pixelInfo[i][j-1])
                    && (pixelInfo[i][j] == pixelInfo[i][j+1])
                    /*&& (pixelInfo[i][j] != pixelInfo[i-1][j-1])
                    && (pixelInfo[i][j] != pixelInfo[i-1][j+1])
                    && (pixelInfo[i][j] != pixelInfo[i+1][j-1])
                    && (pixelInfo[i][j] != pixelInfo[i+1][j+1])*/)) {
                    if (pixelInfo[i][j] !=0) {
                        /*if (pixelInfo[i][j] != pixelInfo[i][j-1] && pixelInfo[i][j-1] !=0) {
                            continue;
                        }
                        if (pixelInfo[i][j] != pixelInfo[i+1][j] && pixelInfo[i+1][j] !=0) {
                            continue;
                        }*/
                        drawPixel(ceilRatio -1, ceilRatio-1, g, x(j), y(i));
                    }
                }
            }
        }

        var overLappingRegions = [];

        for (br=0; br<brainRegions.length; br++) {
            var posX = x(brainRegions[br].x);
            var posY = y(brainRegions[br].y);
            var dsY = dsYoungMetas[br];
            var dsA = dsAdultMetas[br];

            var absRow = (posX + diff)/(2*mvBarWidth);
            var column = parseInt(absRow);
            var absCol = (posY)/((5*mvBarHeight+10));
            var row = parseInt(absCol);
            var ind = (10*row) + column;

            if (grid[ind]) {
                var retFlag = drawBMRegionGlyphs(g, cols, dsY, dsA, posX, posY, valScale, maxChemicalValues);
                if (retFlag) {
                    grid[ind] = false;
                    //gridFill(absRow, absCol, grid)
                }

            } else {
                if (row>5) {
                    ind = 10*(row++);

                } else {
                    ind = 10*(row--);
                }
                if (column >4) {
                    if (grid[ind + 9]) {
                        posx = topLeftGlyph + 8*(2*mvBarWidth) + mvBarWidth;
                        posy = (row*(5*mvBarHeight+10)) + mvBarHeight*5/2;
                        var retFlag = drawBMRegionGlyphs(svg, cols, dsY, dsA, posx, posy, valScale, maxChemicalValues);
                        if (retFlag) {
                            grid[ind + 9] = false;
                            drawMVLine(svg, posx, posy, topLeft+posX, posY)
                        }
                    } else if(grid[ind + 10]){
                        posx = topLeftGlyph +9*(2*mvBarWidth) + mvBarWidth;
                        posy = (row*(5*mvBarHeight+10))  + mvBarHeight*5/2;
                        var retFlag = drawBMRegionGlyphs(svg, cols, dsY, dsA, posx, posy, valScale, maxChemicalValues);
                        if (retFlag) {
                            drawMVLine(svg, posx, posy, topLeft+posX, posY)
                            grid[ind + 10] = false;
                        }
                    }
                } else {
                    if (grid[ind + 1]) {
                        posx =  topLeftGlyph + mvBarWidth;
                        posy = (row*(5*mvBarHeight+10))  + mvBarHeight*5/2;
                        var retFlag = drawBMRegionGlyphs(svg, cols, dsY, dsA, posx, posy, valScale, maxChemicalValues);
                        if(retFlag) {
                            drawMVLine(svg, posx, posy, topLeft+posX, posY)
                            grid[ind + 1] = false;
                        }

                    } else if(grid[ind + 2]){
                        posx = topLeftGlyph + 1*(2*mvBarWidth) + mvBarWidth;
                        posy = (row*(5*mvBarHeight+10))  + mvBarHeight*5/2;
                        var retFlag = drawBMRegionGlyphs(svg, cols, dsY, dsA, posx, posy, valScale, maxChemicalValues);
                        if (retFlag) {
                            drawMVLine(svg, posx, posy, topLeft+posX, posY)
                            grid[ind + 2] = false;
                        }
                    }
                }
            }


        }
        drawMVBDLegend(maxChemicalValues, valScale, cols);
    });

    /*g.append("g")
        .call(d3.axisBottom(x)).attr("transform", "translate(0,584)");
    g.append("g")
        .call(d3.axisLeft(y).ticks(9));*/


    /*for (br=0; br<brainRegions.length; br++) {
        var posX = x(brainRegions[br].x);
        var posY = y(brainRegions[br].y);
        var dsY = dsYoungMetas[br];
        var dsA = dsAdultMetas[br];

        //drawBMRegionGlyphs(g, cols, dsY, dsA, posX, posY, valScale, maxChemicalValues);

    }

    drawMVBDLegend(maxChemicalValues, valScale, cols);*/


}

function addBDText(g, x, y, text, fontSize, color) {
    if (!color) {
        color = "black";
    }
    g.append("text")
        .attr("x", x)
        .attr("y", y + 5)
        /*.attr("dy", ".10em")*/
        .attr("font-size", fontSize +"px")
        .attr("fill", color)
        .text(text);
}

function drawMVBDLegend(maxChemicalValues, valScale, cols) {
    if (cols.length == 5) {
        fiveMetaMax = maxChemicalValues;
        fiveCols = cols;
    }
    maxChemicalValues = fiveMetaMax;
    $("#legend").empty();
    var g = d3.select("#legend").attr("height", 150).
    attr("width", 200).append("g");

    addBDText(g, 5, 20, "0", "10");
    addBDText(g, 20 + mvBarWidth, 20, parseInt(maxMagnitudeBD), "10");
    drawMVRects(valScale(maxMagnitudeBD), mvBarHeight, g, 15, 20, 0);

    addBDText(g, 10, 70, " <", "10");
    addBDText(g, 20 + mvBarWidth, 70, "<", "10");
    addBDText(g, 2 + mvBarWidth, 70, ageSelected, "10");

    var h = 90;var w=2 + mvBarWidth;

    fiveCols.forEach(function (col, i) {
        var width = maxChemicalValues[col].ymax;
        if (_.contains(cols, col) && cols.length <5) {
            drawMVRectsLegends(width, mvBarHeight, g, w - width , h + i*mvBarHeight, 0, true);
        } else {
            drawMVRectsLegends(width, mvBarHeight, g, w - width , h + i*mvBarHeight, 0);
        }
        width = maxChemicalValues[col].amax;
        if (_.contains(cols, col) && cols.length <5) {
            drawMVRectsLegends(width, mvBarHeight, g, w , h + i*mvBarHeight, 0, true);
        } else {
            drawMVRectsLegends(width, mvBarHeight, g, w , h + i*mvBarHeight, 0);
        }


        addBDText(g, 2*w, h + i*mvBarHeight, col, "10");
    })
    $("#legend").show();

}


function dragmove(d) {
    var x = d3.event.x;
    var y = d3.event.y;
    d3.select(this).attr("transform", "translate(" + (x-d.x) + "," + (y-d.y) + ")");
}

var drag = d3.drag()
    .on("drag", dragmove)

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function drawBMRegionGlyphs(g, cols, youngData, adultData, x, y, valScale, maxChemicalValues) {
    var startY = y - cols.length * (mvBarHeight/2) ;
    var endY = startY + cols.length * (mvBarHeight);
    g = g.append("g").attr("class", "draggable").data([ {"x":parseInt(x), "y":parseInt(y)} ])/*.on("mouseover", function(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div	.html(youngData.index)
            .style("left", (d3.event.pageX-20) + "px")
            .style("top", (d3.event.pageY - 58) + "px");
    })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })*/.call(drag);
    var flag =true;
    cols.forEach(function (item, i) {
        yMax = valScale(youngData.metaDetails[item].max);
        if (yMax > maxChemicalValues[item].ymax) {
            maxChemicalValues[item].ymax = yMax;
        }
        yMean = valScale(youngData.metaDetails[item].mean);
        aMax = valScale(adultData.metaDetails[item].max);
        if (aMax > maxChemicalValues[item].amax) {
            maxChemicalValues[item].amax = aMax;
    }
        aMean = valScale(adultData.metaDetails[item].mean);
        if (yMax && yMean && aMax && aMean) {
            drawRangeBar(yMax, mvBarHeight, g, x-yMax, startY + i*mvBarHeight);
            drawMVRects(yMean, mvBarHeight, g, x-yMean, startY + i*mvBarHeight, 0);
            drawRangeBar(aMax, mvBarHeight, g, x, startY + i*mvBarHeight);
            drawMVRects(aMean, mvBarHeight, g, x, startY + i*mvBarHeight, 0);
        } else {
            flag =false;
        }

    })
    if (flag) {
        addBDText(g,x-mvBarWidth/5, startY + (cols.length + 1)*mvBarHeight -5 , youngData.region, "10", "#990000");
        return true;
    } else {
        return false;
    }

}

function drawRangeBar(w, h, g, x, y) {
    var s = g.append("svg");
    //var t = texture[i];
    //var t = textures.lines().thicker();
   // s.call(t);
    s.append("rect").
    attr("x", x ).
    attr("y", y ).
    attr("width", w).
    attr("stroke", 'black').
    attr("fill", "none").
    /*attr("fill", markerFillClr).*/
    attr("fill-opacity", 1).
    attr("stroke-width", 1).
    attr("stroke-opacity", 1).
    attr("height", h)
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
            if (val > maxMagnitudeBD) {
                maxMagnitudeBD = val;
            }
            sum += val;
            c++;
        } else {
            console.log();
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
   // var t = texture[i];
    //var t = textures.lines().thicker();
   // s.call(t);
    s.append("rect").
    attr("x", x ).
    attr("y", y ).
    attr("width", w).
   // attr("stroke", '#f5f5f5').
    attr("fill", '#321f91').
    /*attr("fill", markerFillClr).*/
    attr("fill-opacity", .8).
    attr("stroke-width", '.4').
    attr("stroke-opacity", '.5').
    attr("height", h)
}

function drawPixel(w, h, g, x, y, i) {
    var s = g.append("svg");
    // var t = texture[i];
    //var t = textures.lines().thicker();
    // s.call(t);
    s.append("rect").
    attr("x", x ).
    attr("y", y ).
    attr("width", w).
    // attr("stroke", '#f5f5f5').
    attr("fill", "#737373").
    /*attr("fill", markerFillClr).*/
    attr("fill-opacity", 1).
    /*attr("stroke-width", '.4').
    attr("stroke-opacity", '.5').*/
    attr("height", h)
}

function drawMVRectsLegends(w, h, g, x, y, i, highlight) {
    var s = g.append("svg");
    // var t = texture[i];
    //var t = textures.lines().thicker();
    // s.call(t);
    if (highlight) {
        s.append("rect").
        attr("x", x ).
        attr("y", y ).
        attr("width", w).
        attr("stroke", 'red').
        attr("fill", '#321f91').
        /*attr("fill", markerFillClr).*/
        attr("fill-opacity", .8).
        attr("stroke-width", '2').
        attr("stroke-opacity", '.5').
        attr("height", h)
    } else{
        s.append("rect").
        attr("x", x ).
        attr("y", y ).
        attr("width", w).
        attr("stroke", 'black').
        attr("fill", '#321f91').
        /*attr("fill", markerFillClr).*/
        attr("fill-opacity", .8).
        attr("stroke-width", '.4').
        attr("stroke-opacity", '.5').
        attr("height", h)
    }

}

function drawMVLine(g, x1, y1, x2, y2) {
    g.append("line")
        .style("stroke", "red")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
}