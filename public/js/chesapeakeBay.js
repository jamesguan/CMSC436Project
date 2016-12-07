var parameters = {};
var habitatData = {};
var monthArr = {
    'January':'1/1/15-2/1/15',
    'February':'2/1/15-3/1/15',
    'March   ':'3/1/15-4/1/15',
    'April   ':'4/1/15-5/1/15',
    'May     ':'5/1/15-6/1/15',
    'June    ':'6/1/15-7/1/15',
    'July    ':'7/1/15-8/1/15',
    'August  ':'8/1/15-9/1/15',
    'September':'9/1/15-10/1/15',
    'October ':'10/1/15-11/1/15',
    'November':'11/1/15-12/1/15',
    'Decemeber':'12/1/15-12/311/15'
}
$('#myModal').on('hidden.bs.modal', function () {
    $("#visualisation").empty();
});

function getval(sel) {
    parameters.chartType = sel.value;
    fetchData(parameters, true);
}

function populateMonthButtons() {
    var html= '';
    for (var key in monthArr) {
        html+='<div class="col-md-1"><button type="button" id="'+ key+'" class="btn btn-primary btn-xs" onclick="fetchMonthData(this)"> '+key + '</button> </div>';
        $("#monthButtons").html(html);
    }
}

function fetchMonthData(month) {
    //d3.selectAll("svg:g > *").remove();
    $("#visualisation").empty();
    var dates = monthArr[month.id].split("-");
    parameters.to = dates[0];
    parameters.from = dates[1];
    fetchData(parameters);
}

function createViz(stationId) {
    $('#myModal').modal('show');
    //d3.selectAll("svg:g > *").remove();
    $("#stationId").text(stationId);
    var params = {};
    params.to = '06/05/15';
    params.from = '08/05/15';
    params.stationId = stationId.trim();
    params.chartType = "scatter";
    parameters = params;
    fetchData(params, undefined, true);
    populateMonthButtons();
}

function createHabitatDiv( hData) {
    var speciesList = _.pluck(hData, "Species");
    var uSpeciesList = _.uniq(speciesList, true);
    var LSList = _.pluck(hData, "Life_Stage");
    var uLSList = _.uniq(LSList);
    var specieHtml = '<div class="habitatInfo"><select class="selectBox" id="species" style = "height: 25px; width: 142px" onchange="getHabitatInfo(this);">';
    for (var key in uSpeciesList) {
        specieHtml+= '<option value="'+uSpeciesList[key]+'">'+uSpeciesList[key]+'</option>'
    }
    specieHtml+= '</select>';
    /*$("#habitatDiv").html(specieHtml);*/

    var lifeStageHtml = '<select class="selectBox" id="lifeStage" style = "height: 25px; width: 142px" onchange="getHabitatInfo(this);">';
    for (var key in uLSList) {
        lifeStageHtml+= '<option value="'+uLSList[key]+'">'+uLSList[key]+'</option>'
    }
    lifeStageHtml+= '</select></div>';
    $("#habitatDiv").html(specieHtml + lifeStageHtml);

}

function getHabitatInfo(sel) {
    //d3.selectAll("svg:g > *").remove();
    $("#visualisation").empty();
    fetchData(parameters);
}

function getSelectedSpecie(specie, lifeStage) {
    for (var key in habitatData) {
        if (habitatData[key].Species == specie && habitatData[key].Life_Stage == lifeStage) {
            return habitatData[key];
        }
    }
}

//createViz();

function fetchData(params, update, createHabitat) {
    var data = $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:1337/getData',
        data: JSON.stringify({
            data: params
        }),
        dataType: 'json',
        async: false,
        success: function (data) {
            $('body').append(data);
            habitatData = data.habitatData;
            if (createHabitat) {
                createHabitatDiv(habitatData);
            }
            if (params.chartType) {
                createChart(data, update, params.chartType);
            } else {
                createChart(data, update);
            }
        }
    });
}

function updateViz(dateRange) {
    var params = {};
    var dates = dateRange.split(' - ');
    var to = dates[0];
    var from = dates[1];
    var toDate = to.split('/');
    params.to = toDate[0] + "/" + toDate[1] + "/" + toDate[2].substring(2, 4);
    var fromDate = from.split('/');
    params.from = fromDate[0] + "/" + fromDate[1] + "/" + fromDate[2].substring(2, 4);
    params.stationId = "EE3.1";
    params.chartType = "scatter";
    parameters = params;
    fetchData(params, true);
    //alert(params.to + " : " + params.from);
}

$(function() {

    $('input[name="datefilter"]').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        }
    });

    $('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('M/D/Y') + ' - ' + picker.endDate.format('M/D/Y'));
        updateViz($(this).val());
    });

    $('input[name="datefilter"]').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });

});

function createChart(data, update, chartType) {
    //var data = JSON.parse(data.responseText);
    var vis = d3.select("#visualisation");
    if (update) {
        //d3.selectAll("svg:g > *").remove();
        $("#visualisation").empty();
        //var vis = d3.select("#visualisation");
    }
    InitChart(data, vis, chartType);
}

function createGlyph(markerId, data, station) {

    var vis = d3.select($("#"+markerId).get(0))
        .append("svg")
        .attr("width", 54)
        .attr("height", 64);
    var WIDTH = 80,
        HEIGHT = 80;
    var wTempSScale = d3.scale.linear().range([0, 20]).domain([0,data.maxWTempS]);
    var wTempBScale = d3.scale.linear().range([0, 20]).domain([0,data.maxWTempB]);
    var salinitySScale = d3.scale.linear().range([0, 20]).domain([0,data.maxSalinityS]);
    var salinityBScale = d3.scale.linear().range([0, 20]).domain([0,data.maxSalinityB]);
    var secchiScale = d3.scale.linear().range([0, 20]).domain([0,data.maxSecchi]);
    var chlaScale = d3.scale.linear().range([0, 20]).domain([0,data.maxCHLA]);
    vis.append("rect").
    attr("x", 22).
    attr("y", 22).
    attr("width", 10).
    attr("stroke", 'black').
    attr("opacity", 0.4).
    attr("stroke-width", '1').
    attr("height", 20).attr("fill", 'none');

    vis.append("rect").
    attr("x", 20- wTempSScale(station.wTempS)).
    attr("y", 22).
    attr("width", wTempSScale(station.wTempS)).
    attr("opacity", 0.7).
    attr("height", 9).attr("fill", 'blue');

    vis.append("rect").
    attr("x", 20- wTempBScale(station.wTempB)).
    attr("y", 32).
    attr("width", wTempBScale(station.wTempB)).
    attr("opacity", 0.9).
    attr("height", 9).attr("fill", 'blue')

    vis.append("rect").
    attr("x", 34).
    attr("y", 22).
    attr("width", salinitySScale(station.salinityS)).
    attr("opacity", 0.8).
    attr("height", 9).attr("fill", 'red');

    vis.append("rect").
    attr("x", 34).
    attr("y", 32).
    attr("opacity", 1).
    attr("width", salinityBScale(station.salinityB)).
    attr("height", 9).attr("fill", 'red')

    vis.append("rect").
    attr("x", 22).
    attr("y", 20 - secchiScale(station.secchi)).
    attr("width", 10).
    attr("opacity", 0.8).
    attr("height", secchiScale(station.secchi)).attr("fill", 'orange')

    vis.append("rect").
    attr("x", 22).
    attr("y", 44).
    attr("width", 10).
    attr("height", chlaScale(station.CHLA)).attr("fill", 'green');

    fillDepth(vis, data.maxDepth ,station.depth);

}

function fillDepth(vis, maxdepth, depth) {
    var stickSize = Math.ceil(maxdepth/4);
    var val = parseFloat(depth/stickSize);
    var floorVal = Math.floor(val);
    var decVal = val -floorVal;
    var i=0;
    for (i; i<floorVal; i++) {
        vis.append("rect").
        attr("x", 23).
        attr("y", 38 - i*4).
        attr("width", 8).
        attr("opacity", 0.7).
        attr("height", 3).attr("fill", 'black')
    }
    var stickHeight = Math.round(decVal*3) || 1;

    vis.append("rect").
    attr("x", 23).
    attr("y", 38 - i*4).
    attr("width", 8).
    attr("opacity", 0.7).
    attr("height", stickHeight).attr("fill", 'black')
}

function InitChart(data, vis, chartType) {

    var color = d3.scale.category10();
    var colorArr = {"CHLAData": "blue", "WTEMP": "#cc66ff", "DO": "#7a7a52", "SECCHI": "#ffcccc", "SALINITY" : "#ffcccc"};
    var WIDTH = 400,
        HEIGHT = 400,
        padding = 30,
        MARGINS = {
            top: 100,
            right: 20,
            bottom: 100,
            left: 70
        }/*,
         lSpace = WIDTH / (dataGroupGender.length)*/;
    //xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, data.CHLAData.max]),
    yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([data.maxDepth,0]),
        /*xAxis = d3.svg.axis()
         .scale(xScale),*/
        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

    var xScales = [];
    xScales['CHLAData'] = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, data.CHLAData.max]);
    xScales['DO'] = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, data.DO.max]);
    xScales['SALINITY'] = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, data.SALINITY.max]);
    xScales['WTEMP'] = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, data.WTEMP.max]);

    var xAxis = [];
    xAxis['CHLAData'] = d3.svg.axis().scale(xScales['CHLAData']);
    xAxis['DO'] = d3.svg.axis().scale(xScales['DO']);
    xAxis['SALINITY'] = d3.svg.axis().scale(xScales['SALINITY']);
    xAxis['WTEMP'] = d3.svg.axis().scale(xScales['WTEMP']);

    vis.append("svg:g")
        .attr("class", "x axis CHLA")
        /*.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")*/
        .attr("transform", "translate(0,30)")
        .call(xAxis['CHLAData']);
    vis.append("svg:g")
        .attr("class", "x axis DO")
        /*.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")*/
        .attr("transform", "translate(0,80)")
        .call(xAxis['DO']);
    vis.append("svg:g")
        .attr("class", "x axis SALINITY")
        /*.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")*/
        .attr("transform", "translate(0,320)")
        .call(xAxis['SALINITY']);
    vis.append("svg:g")
        .attr("class", "x axis WTEMP")
        /*.attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")*/
        .attr("transform", "translate(0,370)")
        /*                           .attr('stroke', colorArr['WTEMP'])
         .attr('fill', colorArr['WTEMP'])*/
        .call(xAxis['WTEMP']);

    vis.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (MARGINS.left - 20 ) + ",0)")
        .call(yAxis);
    var lineGen = []

    lineGen['CHLAData'] = d3.svg.line()
        .x(function (d) {
            return xScales['CHLAData'](d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .interpolate("basis");

    lineGen['DO'] = d3.svg.line()
        .x(function (d) {
            return xScales['DO'](d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .interpolate("basis");
    lineGen['SALINITY'] = d3.svg.line()
        .x(function (d) {
            return xScales['SALINITY'](d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .interpolate("basis");
    lineGen['WTEMP'] = d3.svg.line()
        .x(function (d) {
            return xScales['WTEMP'](d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .interpolate("basis");

    if (chartType == 'scatter') {
        var selectedSpecie = getSelectedSpecie($("#species").val(),$("#lifeStage").val());
        for (var key in data) {
            if (key == 'maxDepth' || key == 'habitatData') {
                continue;
            }
            vis.append("svg:g").selectAll("scatter-dots")
                .data(data[key].vals)
                .enter().append("svg:circle")
                .attr("cx", function (d) { return xScales[key](d.x); })
                .attr("cy", function (d) { return yScale(d.y); } )
                .attr("r", 5)
                .attr("stroke", function(d) {
                    if (key == "DO") {
                        if (d.x > parseFloat(selectedSpecie.Dissolved_Oxygen.split(" ")[1] || 0)) {
                            return 'green';
                        } else {
                            return 'red';
                        }
                    } else if (key == "SALINITY") {
                        if (d.x > parseFloat(selectedSpecie.Salinity_Low || 0) && d.x < parseFloat(selectedSpecie.Salinity_High ||0)) {
                            return 'green';
                        } else {
                            return 'red';
                        }
                    } else if (key == "WTEMP") {
                        if (d.x > parseFloat(selectedSpecie.Temp_Low || 0) && d.x < parseFloat(selectedSpecie.Temp_High || 0 )) {
                            return 'green';
                        } else {
                            return 'red';
                        }
                    } else {
                        return 'green';
                    }
                })
                .attr("shape-rendering", "geometricPrecision")
                .attr("fill", colorArr[key]);
        }
    } else {
        for (var key in data) {
            if (key == 'maxDepth' || key == 'habitatData') {
                continue;
            }
            var func = lineGen[key];
            vis.append('svg:path')
                .attr('class', 'lineCurve')
                .attr('d', func(data[key].vals))
                .attr('stroke', colorArr[key])
                .attr('stroke-width', 2)
                .attr('id', 'line_')
                .attr('fill', 'none');
            /*vis.append("text")
             .attr("x", (lSpace / 2) + i * lSpace)
             .attr("y", HEIGHT)
             .style("fill", colorArr[d.gender])
             .attr("class", "legend")
             /!*.on('click', function () {
             var active = d.active ? false : true;
             var opacity = active ? 0 : 1;
             d3.select("#line_" + d.gender).style("opacity", opacity);
             d.active = active;
             })
             .text(d.gender);*!/*/
        } }


    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (padding / 2) + "," + (HEIGHT / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Depth");

    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (WIDTH / 2) + "," + (HEIGHT - (padding / 3) - 30) + ")")  // centre below axis
        .attr("fill", "#cc66ff")
        .text("Water Temperature (in celcius)");

    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (WIDTH / 2) + "," + (20) + ")")  // centre below axis
        .attr("fill", "blue")
        .text("CHLA");

    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (WIDTH / 2) + "," + (70) + ")")  // centre below axis
        .attr("fill", "#7a7a52")
        .text("Dissolved Oxygen");

    vis.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (WIDTH / 2) + "," + (HEIGHT - (padding / 3) - 80) + ")")  // centre below axis
        .attr("fill", "#ffcccc")
        .text("Salinity");

}