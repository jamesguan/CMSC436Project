/**
 * Created by Abhishek on 4/22/2017.
 */


/*d3.csv("brainRegions.csv", function(error, d) {
    brainRegions = d;
});*/
d3.csv("brainIndexes.csv", function(error, d) {
    var obj = [];
    d.forEach(function (i) {
        brainIndexes[i.index] = i.region;
    })

});

function brainViz(data, columns,  patientId) {
    /*$("#scatter").empty();
    $("#legend").empty();
    $("#resizeBox").empty();
    $("#resizeBox").hide();
    $("#resizeBoxText").hide();
    $("#map").hide();
    $("#container").hide();*/
    $("#legendContainer").height(558*heightRatio);
    /*var patientdata;
    if (!patientId) {
        patientdata = data[0];
    }
    var groupByBrainSlice = d3.nest()
        .key(function (d) {
            return d.z;
        })
        .entries(brainRegions);

    var slice = groupByBrainSlice[5];

    var patientRecords = {};
    var pids = []
    data[columns[0]].forEach(function (obj) {
       // patientRecords[obj.Subject] = {};
        pids.push(obj.Subject);
    })
    for(i=0; i< pids.length; i++){
        var record = [];

        for (br=0; br<brainRegions.length; br++) {
            var obj = {};
            obj.x = brainRegions[br].x;
            obj.y = brainRegions[br].y;
            obj.z = brainRegions[br].z;
            columns.forEach(function (c) {
                var val = parseInt(data[c][i][brainIndexes[brainRegions[br].index].replace("_", " ")]);
                if (val) {
                    obj[c] = val;
                } else {
                    obj[c] = 10;
                }
            })
            obj.region = brainIndexes[brainRegions[br].index].replace("_", " ");
            record.push(obj);
        }

        patientRecords[pids[i]] = record;

    }
    g_patientId = pids[0];
    dataStore = patientRecords[pids[0]];
    quantitySelected = 'Choline';
    createViz(patientRecords[pids[0]], 'Choline');*/
    cutPlaneSelected = 90;
    selectedVizType = "mv"
    drawMeanMVCC(data, columns, true);
    $('.selectpicker').selectpicker('val', ['Choline','Glx', 'NAA', 'Inositol', 'Creatine']);

    /*$("#scatterDiv").show();*/





}

function initiateAgeSlider(min, max) {
    $( "#ageSlider" ).slider({
        max: parseInt(max),
        min: parseInt(min),
        slide: function( event, ui ) {
            $("#ageValue").text(ui.value)
        },
        stop: function (event, ui) {
            ageSelected = ui.value;
            getQuantity(undefined, false);
        }
    });
    $( "#ageSlider" ).slider( "value", ageSelected );
    $("#ageValue").text( ageSelected);
}

function initiatePlaneSlider(min, max, step) {
    $( "#planeSlider" ).slider({
        max: parseInt(max),
        min: parseInt(min),
        slide: function( event, ui ) {
            $("#planeValue").text(ui.value)
        },
        stop: function (event, ui) {
            cutPlaneSelected =  ui.value;
            getCutPlane();
        },
        step: step
    });
    $( "#planeSlider" ).slider( "value", cutPlaneSelected );
    $("#planeValue").text(cutPlaneSelected)
}

function initialHide(redraw) {
    scaleFactor = 1;
    $("#ageSlider").hide();
    $("#planeSlider").hide();
    $("#scatter").hide();
    $("#map").hide();
    $("#scatterDiv").hide()
    $("#legendDiv").hide();
    $("#resizeBox").hide();
    $("#legendContainer").hide();
    if (!redraw) {
        $("#scatter").empty();
    }
    $("#legend").empty();
    $("#legend").hide();
    $("#container").empty();
    $("#quantitiesDiv").hide();
    //$("#resizeBox").empty();
    $("#map").hide();
    $("#container").hide();
    
}

function finalShow(vizType) {
    if (vizType == "2D") {
        $("#planeSlider").show();
        $("#scatter").show();
        $("#legendDiv").show();
        $("#resizeBox").show();
        $("#legend").show();
        $("#scatterDiv").show()
        $("#legendContainer").show();
    } else if (vizType == "mv") {
        $("#ageSlider").show();
        $("#planeSlider").show();
        $("#scatter").show();
        $("#legendDiv").show();
        $("#legend").show();
        $("#quantitiesDiv").show();
        $("#scatterDiv").show()
        $("#legendContainer").show();
    } else if(vizType == "3D") {
        $("#container").show();
        $("#legendDiv").show();
        $("#legend").show();
        $("#legendContainer").show();
    }

    $("#legendDiv").height(heightRatio*610);
}

function gridFill(r, c, grid) {
    var pr = parseInt(r);
    var pc = parseInt(c);
    if(r - pr > .85 ) {
        grid[(pr+1)*10 + pc] = false
    }
    if(c - pc > .85) {
        grid[(pr)*10 + pc+1] = false;
    }
    if(r - pr < .15 ) {
        grid[(pr-1)*10 + pc] = false
    }
    if(c - pc < .15) {
        grid[(pr)*10 + pc-1] = false;
    }

}


function USAMapViz(data) {
    initialHide();
    selectedHeight = 50; selectedWidth = 50;
    g_margin.top = 0;
    g_margin.left = 0;
    prefNumberSeries = [selectedWidth*.005 ,selectedWidth*.04, selectedWidth*.2, selectedWidth];
    var svg = d3.select("#scatter").attr("height", brHeight)/*.call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
     svg.attr("transform", d3.event.transform)
     }))*/.append("g");
    var mR = 0;
    var mB = 0;
    var margin = {top: 0 + mB, right: mR, bottom: 0, left: 0},
        width = brWidth,
        height = brHeight,
        domainwidth = width - margin.left - margin.right,
        domainheight = height - margin.top - margin.bottom;



    var g = svg.append("g").attr("class", "mapUSA")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /*g.append("rect")
     .attr("width", width - margin.left)
     .attr("height", height- margin.top)
     .attr("fill", "#f5f5f5");*/

    var x = d3.scaleLinear()
        .domain([-126,-66])
        .range([0, domainwidth]);
    var y = d3.scaleLinear()
        .domain([25,49])
        .range([domainheight, 0]);
    var tr = brHeight - 24 - mB;

        /*g.append("g")
            .call(d3.axisBottom(x)).attr("transform", "translate(0,"+tr+")");
        g.append("g")
            .call(d3.axisLeft(y).ticks(9));*/
        data = _.where(data, {iso3: "USA"});

    data = _.sortBy(data, function(item) {
        return parseFloat(item['q_population']);
    });
    draw(data.reverse(), g, x, y, 'q_population', false);
    $("#scatter").css("background-image", "url(USA.JPG)");

}