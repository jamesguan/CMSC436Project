var prefNumberSeries = [];
var selectedHeight = 30, selectedWidth = 30;
var prevWidth = 40;
const twoDseries = [1,selectedWidth/4, selectedWidth/2, selectedWidth];
var dataStore={};
var brHeight = window.innerHeight - 54;
var brWidth = (window.innerWidth*10/12) -10;
var scalingRatio = 1;
var scaleFactor = 1;
var firstClickMap = true;
var orientedViz = false;
var is3D = false;
var quantitySelected = 'val';
var brainRegions = {};
var brainIndexes = {};
var brainData = {};
var isBrain = false;
var isMV = false;
var dsYoungMetas = {};
var dsAdultMetas = {};
var maxMagnitudeBD = 0;
var mvBarHeight = 8 * (brHeight/600);
var mvBarWidth = 40 * (brWidth/1128);
var fiveMetaMax = {};
var fiveCols = [];
var cutPlaneSelected = 0;
var ageSelected= 18;
var selectedVizType = "2D";
var legendDivRatio = 1;
var scatterDivRatio = 1;
var heightRatio = 1;
var threeDStore = {};

function initialConfig() {
    brHeight = window.innerHeight - 54;
    mvBarHeight = 8 * (brHeight/600);
    brWidth = (window.innerWidth*10/12) -10;
    mvBarWidth = 40 * (brWidth/1128);
    heightRatio = brHeight/608;
    legendDivRatio = (window.innerWidth*2/12)/228;
    scatterDivRatio = brWidth/1128;
    /*selectedHeight = heightRatio*selectedHeight;
    selectedWidth = legendDivRatio*selectedWidth;
    prevWidth = prevWidth*legendDivRatio;*/
}

function readData() {
    $("#legendDiv").hide();
    $("#scatter").hide();
    d3.csv("spinVSpos.csv", function(error, data) {
        if (error) throw error;
        var columns = filterQuantities(data.columns);
        populateDropdown(columns, false, true);
        vizRouter("2D", false, data, 'q_magnitude');
        /*dataStore = data;
        createViz(data, quantitySelected);
        $("#quantities").selectpicker('val', 'q_magnitude');
        $("#quantities").selectpicker("refresh");*/
    });
}

function selectRandom1000(data) {
    var data1 = [];
    for (i=0; i<50; i++) {
        data1[i] = data[Math.round(Math.random()*500000)];
    }
    return createsampleVals(data1);
}

function createViz(data, val, multi, orient) {

    isMV = multi;
    var svg = d3.select("#scatter").attr("height", brHeight)/*.call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    }))*/.append("g");
    var mR = selectedWidth;
    var mB = selectedHeight;
    if (multi) {
        mR = val.marginRight;
        mB = val.marginBottom;
    }
    var margin = {top: 5 + mB, right: mR, bottom: 0, left: 25},
        width = brWidth,
        height = brHeight,
        domainwidth = width - margin.left - margin.right,
        domainheight = height - margin.top - margin.bottom;



    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /*g.append("rect")
        .attr("width", width - margin.left)
        .attr("height", height- margin.top)
        .attr("fill", "#f5f5f5");*/

        var x = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.x);
            }) -1, d3.max(data, function (d) {
                return parseInt(d.x);
            })+1])
            .range([0, domainwidth]);
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.y );
            })-1, d3.max(data, function (d) {
                return parseInt(d.y);
            })+1])
            .range([domainheight-25, 0]);
    var tr = brHeight - 24 - mB;

    if (val != 'val') {
        g.append("g")
            .call(d3.axisBottom(x)).attr("transform", "translate(0,"+tr+")");
        g.append("g")
            .call(d3.axisLeft(y).ticks(9));
    }



    if (multi) {
        drawMVCC(data, g, x, y, val)
    } else {
        data = _.sortBy(data, function(item) {
            return parseFloat(item[val]);
        });
        draw(data.reverse(), g, x, y, val, orient);
    }
    var planes = _.pluck(dataStore, "key");
    _.sortBy(planes, function (num) {
        return parseFloat(num);
    })
    if (cutPlaneSelected == 0) {
        cutPlaneSelected = planes[5];
    }
    initiatePlaneSlider(planes[0], planes[planes.length -1], .25);
}

function createsampleVals(data) {
    data.forEach(function (item) {
        item.val = Math.random()*10000;
    })
    return data;
}

function scaleValues(min) {
    min = min.toExponential();
    var exponent= String(min).split(/[eE]/)[1];
    scaleFactorCalc(Math.abs(exponent));
}

function scaleFactorCalc(num) {
    scaleFactor = 1;
    for(i=0; i<num; i++){
        scaleFactor*=10;
    }
}

function draw(data, g,x, y, val, orient) {
    var min = d3.min(data, function (d) {
        if (parseFloat(d[val])) {
            return parseFloat(d[val]);
        }
        //return parseFloat(d[val]);
    });

    if (min < 1) {
        scaleValues(min);
    }

    var max = d3.max(data, function (d) {
        return parseFloat(d[val] * scaleFactor) ;
    });

    var normMax = normalizeExtremes(max);
    var ratio = calculateScalingRatio(normMax);
    var groups = legendGroup();

    drawLegend();

    data.forEach(function (item) {
        var degree = Math.atan2(item.directionY,item.directionX)* (180 / Math.PI);
        var dmnsn = {};
        if (min < 1) {
            dmnsn = getDimensions(item[val]* scaleFactor, groups, ratio);
        } else {
            dmnsn = getDimensions(item[val], groups, ratio);
        }
        var h = dmnsn.height;
        var w = dmnsn.width;
        var posX = x(item.x);
        var posY = y(item.y) - h;
        var x2 = posX +h*(item.directionX);
        var y2 = posY +h*(item.directionY);
        var x3 = posX +w*(-item.directionY);
        var y3 = posY +w*(item.directionX);
        var x4 = x2 +w*(-item.directionY);
        var y4 = y2 +w*(item.directionX);
        var posstr = "M "+posX+" "+posY+" "+ "L "+ (posX+w)+" " + posY+" " + "L " + (posX+w)+" " + (posY+h)+" " + "L " + posX+" " + (posY+h)+" " + "Z";
        if (orient) {
            posstr = "M "+posX+" "+posY+" "+ "L "+ (x2)+" " + y2+" " + "L " + (x4)+" " + (y4)+" " + "L " + x3+" " + (y3)+" " + "Z"
        }
        var s = g.append("svg");
        s.append("svg:path")
            //.attr("d","M "+posX+" "+posY+" "+ "L "+ (posX+w)+" " + posY+" " + "L " + (posX+w)+" " + (posY+h)+" " + "L " + posX+" " + (posY+h)+" " + "Z")
            .attr("d",posstr)
            .style("stroke-width", .5)
            .style("stroke", '#f5f5f5')
            .style("stroke-opacity", '1')
            .style("fill", markerFillClr);
        /*attr("x", x(item.x) - dmnsn.width/2).
         attr("y", y(item.y) - dmnsn.height/2).*/
        /*attr("x", x(-20) ).
        attr("y", y(-20) ).
        attr("width", 50).
        attr("stroke", '#f5f5f5').
        attr("fill", markerFillClr).
        attr("fill-opacity", 1).
        attr("stroke-width", '.4').
        attr("stroke-opacity", '.5').
        attr("height", 50);*/
    })
    /*$("#legendDiv").show();
    $("#resizeBox").show();
    $("#resizeBoxText").show();
    $("#scatter").show();*/
    finalShow("2D");
}

function normalizeExtremes(num) {
    var tens = 0;var norm=0;
    while(num > 10) {
        num = parseInt(num/10);
        tens++;

    }

    /*/!*if (num >=2 && num<5) {
        norm = 5 * Math.pow(10, tens);
    } else if (num >=0 && num<2) {
        norm*!/ = 2 * Math.pow(10, tens);
    } else {*/
        norm = 10 * Math.pow(10, tens);
    /*}*/
    return norm;
}

function calculateScalingRatio(num) {
    scalingRatio = num/(selectedHeight*selectedWidth)
    return scalingRatio;
}

function legendGroup() {
    var arr = [];
    prefNumberSeries.forEach(function(item) {
        if(item<=selectedWidth) {
            var obj = {};
            obj.width = item;
            obj.maxValue = item*selectedHeight;
            arr.push(obj);
        }
    })
    if (prefNumberSeries.indexOf(selectedWidth) == -1) {
        var obj = {};
        obj.width = selectedWidth;
        obj.maxValue = selectedWidth*selectedHeight;
        arr.push(obj);
    }
    return arr;
}

function getDimensions(num, groups, ratio) {
    var scaledValue = parseInt(num/ratio);
    var dmnsn = {};
    groups.some(function (item) {
        if (scaledValue< item.maxValue) {
            dmnsn.width = item.width;
            dmnsn.height = parseInt(scaledValue/item.width);
            return true;
        }
    })
    return dmnsn;
    
}

function legendHeightForGroup(num) {
    var maxVal = num*selectedHeight*scalingRatio;
    return parseInt(normalizeExtremes(maxVal)/(num*scalingRatio));
}

function drawLegend1() {
    drawResizeBox();
    //var g = d3.select("#legend").attr("height", brHeight - $("#resizeBox").height() - 5).append("g");
    var g = d3.select("#legend").attr("height", brHeight - 80).
    attr("width", 370).append("g");
    var h=0;
    for (i=1; i<=4; i++) {
        var w=5, height=0;
        for (j=0; j<prefNumberSeries.length; j++) {
            var selectedHeight = legendHeightForGroup(prefNumberSeries[j]);
            height = selectedHeight*i/4;
            var y = h+selectedHeight-height;
            if (prefNumberSeries[j] <=selectedWidth) {
                g.append("rect").
                attr("x", w).
                attr("y", y).
                attr("width", prefNumberSeries[j]).
                attr("fill", markerFillClr).
                attr("fill-opacity", 1).
                attr("stroke", '#ffffff').
                attr("stroke-width", '.4').
                attr("stroke-opacity", '.5').
                attr("height", height);
                g.append("text")
                    .attr("x", w-3)
                    .attr("y", h+selectedHeight +10)
                    .attr("dy", ".35em")
                    .text(convertLabel(parseInt(prefNumberSeries[j]*height*(scalingRatio))));
                w+=  prefNumberSeries[j] +30;
            } else if(prefNumberSeries.indexOf(selectedWidth) == -1){
                g.append("rect").
                attr("x", w).
                attr("y", y).
                attr("width", selectedWidth).
                attr("fill", markerFillClr).
                attr("stroke", '#ffffff').
                attr("stroke-width", '.4').
                attr("stroke-opacity", '.5').
                attr("fill-opacity", 1).
                attr("height", height);
                g.append("text")
                    .attr("x", w)
                    .attr("y", h+selectedHeight +10)
                    .attr("dy", ".35em")
                    .text(convertLabel(parseInt(selectedWidth*height*(scalingRatio))));
                break;
            } else {
                break;
            }
        }
        h+= height+ 50;
    }
}

function drawLegend() {
    //drawResizeBox();
    var calcHeight = 2.3*selectedHeight + 130;
    var calcWidth = 1 + 1.75*(selectedWidth) + 110
    //var g = d3.select("#legend").attr("height", brHeight - $("#resizeBox").height() - 5).append("g");
    var g = d3.select("#legend").attr("height", calcHeight).
    attr("width", calcWidth).append("g");
    $("#legendContainer").height(brHeight - 50 - (heightRatio*100));
    var h=0;
    var heightArr = [0,.5, .8, 1]
    for (i=1; i<=3; i++) {
        var w=5, height=selectedHeight*heightArr[i]; // changed from i/4
        var y = h+selectedHeight-height;
        for (j=0; j<prefNumberSeries.length; j++) {
            if (prefNumberSeries[j] <=selectedWidth) {
                g.append("rect").
                attr("x", w).
                attr("y", y).
                attr("width", prefNumberSeries[j]).
                attr("fill", markerFillClr).
                attr("fill-opacity", 1).
                attr("stroke", '#ffffff').
                attr("stroke-width", '.4').
                attr("stroke-opacity", '.5').
                attr("height", height);
                if (prefNumberSeries[j] == 1) {
                    g.append("text")
                        .attr("x", w-3)
                        .attr("y", h+selectedHeight +10) // changed from 10
                        .attr("dy", ".35em")
                        .attr("font-size", "9px")
                        .text(convertLabel(Math.ceil(prefNumberSeries[j]*height*(scalingRatio) * selectedWidth/prevWidth)));
                    w+=  prefNumberSeries[j] +35; // changed from 50
                } else{
                    g.append("text")
                        .attr("x", w-3)
                        .attr("y", h+selectedHeight +10)
                        .attr("dy", ".35em")
                        .attr("font-size", "9px")
                        .text(convertLabel(Math.ceil(prefNumberSeries[j]*height*(scalingRatio))));
                    w+=  prefNumberSeries[j] +25; // changed from 50
                }

            } else if(prefNumberSeries.indexOf(selectedWidth) == -1){
                g.append("rect").
                attr("x", w).
                attr("y", y).
                attr("width", selectedWidth).
                attr("fill", markerFillClr).
                attr("stroke", '#ffffff').
                attr("stroke-width", '.4').
                attr("stroke-opacity", '.5').
                attr("fill-opacity", 1).
                attr("height", height);
                g.append("text")
                    .attr("x", w)
                    .attr("y", h+selectedHeight +10)
                    .attr("dy", ".35em")
                    .attr("font-size", "9px")
                    .text(convertLabel(Math.ceil(selectedWidth*height*(scalingRatio))));
                break;
            } else {
                break;
            }
        }
        h+= height+ 50; // changed from 50
    }
}

function convertLabel(num) {
    if (num >= 1000000) {
        if (isInt(num/1000000)) {
            return (num/1000000) + "M";
        } else {
            return parseInt(num/1000000) + "M";
        }
    }
    else if (num >= 1000) {
        if (isInt(num/1000)) {
            return (num/1000) + "K";
        } else {
            return parseInt(num/1000) + "K";
        }
    }  else {
        return num;
    }
}

function isInt(n) {
    return n % 1 === 0;
}

function drawResizeBox() {
    var R = Raphael("resizeBox", 100*legendDivRatio, 100*legendDivRatio),
        c = R.rect(0, 0, selectedWidth, selectedHeight).attr({
            fill: markerFillClr,
            stroke: "none",
            opacity: 1,
            cursor: "move"
        }),
        s = R.rect(selectedWidth -40 , selectedHeight-40, 40, 40).attr({
            fill: markerFillClr,
            stroke: "none",
            opacity: 1,
            cursor: "move"
        }),
        rstart = function () {
            // storing original coordinates
            this.ox = this.attr("x");
            this.oy = this.attr("y");

            this.box.ow = this.box.attr("width");
            this.box.oh = this.box.attr("height");
        },
        rmove = function (dx, dy) {
            // move will be called with dx and dy
            this.attr({x: this.ox + dx, y: this.oy + dy});
            this.box.attr({width: this.box.ow + dx, height: this.box.oh + dy});

        },
        rend= function() {
            //prevWidth = selectedWidth;

            if (this.box.attr("height") > 100*legendDivRatio) {
                this.box.attr("height", 100*legendDivRatio);
            }

            if (this.box.attr("width") > 100*legendDivRatio) {
                this.box.attr("width", 100*legendDivRatio);
            }
            if (this.box.attr("height") > this.box.attr("width")) {
                selectedHeight = selectedWidth =  this.box.attr("height")
            } else {
                selectedHeight = selectedWidth =  this.box.attr("width");
            }
            prefNumberSeries = [1*(selectedWidth/prevWidth), selectedWidth/4, selectedWidth/2, selectedWidth];
            /*selectedHeight = this.box.attr("height");
            selectedWidth = this.box.attr("width");*/
            /*$("#scatter").empty();
            $("#legend").empty();*/
            //$("#resizeBox").empty();
            if (isMV) {
                getQuantity();
            } else{
                getCutPlane();
                //createViz(dataStore, quantitySelected);
            }
        };
    // rstart and rmove are the resize functions;
    //c.drag(move, start, up);
    c.sizer = s;
    s.drag(rmove, rstart, rend);
    s.box = c;

}

function threeD(data) {
    selectedHeight= 100;
    selectedWidth = 100;
    prefNumberSeries = threeDSeries;
    threeDStore = data;
    create3dViz(data, quantitySelected);
    $("#legendContainer").height(heightRatio*610);
    finalShow("3D");
    /*$("#map").hide();
    $("#scatterDiv").hide();
    $("#resizeBox").hide();
    $("#resizeBoxText").hide();
    $("#container").show();*/
}

function twoD() {
    selectedHeight= 20;
    selectedWidth = 20;
    prefNumberSeries = twoDseries;
    /*$("#scatter").empty();
    $("#legend").empty();
    //$("#resizeBox").empty();
    $("#map").hide();
    $("#container").hide();*/
    //createViz(dataStore, quantitySelected);
    getCutPlane();
    /*$("#scatterDiv").show();
    $("#resizeBox").show();
    $("#resizeBoxText").show();*/

}

function mapViz() {
    selectedHeight= 50;
    selectedWidth = 50;
    prefNumberSeries = twoDseries;
    $("#map").show();
    if(firstClickMap) {
        initMap();
        firstClickMap = false;
    }
    $("#scatterDiv").hide();
    $("#container").hide();
}

function zoom(svg) {
    svg.attr("transform", d3.event.transform);
}

function vizRouter(type, pageLoad, data, quantity) {
    if (pageLoad) {
        $("#map").hide();
        prefNumberSeries = twoDseries;
        readData();
        return;
    }
    data = data || dataStore;
    if(type == "2D") {
        selectedHeight= 30;
        selectedWidth = 30;
        prefNumberSeries = twoDseries;
        quantitySelected = quantity;
        selectedVizType = "2D";
        createVizFromFile(data, quantitySelected);
    } else if (type == "3D") {
        selectedHeight= 100;
        selectedWidth = 50;
        selectedVizType = "3D";
        prefNumberSeries = threeDSeries;
        threeD(data);
    } else if(type == "Maps") {
        selectedHeight= 50;
        selectedWidth = 50;
        prefNumberSeries = twoDseries;
        mapViz();
    }
}

function filterQuantities(columns) {
    var quants = _.filter(columns, function(c) {
        return c.includes("q_");
    });
    return quants;
}

d3.select("#fileUpload").on("change", function(){
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //Files vars
        var uploadFile = this.files[0];
        var name = uploadFile.name;
        var filereader = new FileReader();
        initialHide();
        filereader.onload = function (e) {
            //Txt file output
            var txtRes = filereader.result;
            try {
                if (name.split(".")[1] == "csv") {
                    cutPlaneSelected = 0;
                    var data = d3.csvParse(txtRes);
                    var columns = filterQuantities(data.columns);
                    populateDropdown(columns);
                    //determmineVizType(data.columns);
                    if (data.length > 5000) {
                        $("#resizeBox").empty();
                        selectedHeight =30;
                        selectedWidth =30;
                        drawResizeBox();
                        vizRouter("2D", false, data, columns[0]);
                    } else {
                        vizRouter("3D", false, data, columns[0]);
                    }
                } else {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {type : 'binary'});
                    brainData = {};
                    var columns = [];
                    workbook.SheetNames.forEach(function(sheetName){
                        // Here is your object
                        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        //var json_object = JSON.stringify(XL_row_object);
                        brainData[sheetName] = XL_row_object;
                        if (sheetName == "Age") {
                            return;
                        }
                        columns.push(sheetName);
                    })
                    selectedVizType = "mv";
                    populateDropdown(columns, true);
                    brainViz(brainData, columns);
                }
            }
            catch(e) {
                console.log(e);
            }
        }
        filereader.readAsBinaryString(uploadFile);
    }
});

function createVizFromFile(data, q) {
    var dataGroupByZ = d3.nest()
        .key(function (d) {
            return d.z;
        })
        .entries(data);
    //data = selectRandom1000(data);
    //ThreeDDataStore = data;
    var planes = _.pluck(dataGroupByZ, "key");
    //populateCuttingPlanes(planes)
    dataStore = dataGroupByZ;
    //dataStore = dataGroupByZ[0].values;
    //$("#scatter").empty();
    //$("#legend").empty();
    //$("#resizeBox").empty();
    //$("#map").hide();
    //$("#container").hide();
    initialHide();
    prefNumberSeries = [1*(selectedWidth/prevWidth), selectedWidth/4, selectedWidth/2, selectedWidth];
    //quantitySelected = 'q_magnitude';
    //quantitySelected = $("#quantities").val()[0];
    //cutPlaneSelected = dataGroupByZ[0].key;
    createViz(dataGroupByZ[5].values, q);
    //$("#scatterDiv").show();
}

function createCCGlyphs(markerId, data, station) {

    var vis = d3.select($("#"+markerId).get(0))
        .append("svg")
        .attr("width", selectedWidth)
        .attr("height", selectedHeight);

    vis.append("rect").
    attr("x", 0).
    attr("y", 0).
    attr("width", Math.random() * selectedWidth).
    attr("opacity", 1).
    attr("height", Math.random() * selectedHeight).attr("fill", markerFillClr);

}

function uploadTexture() {
    $('#textureFile').trigger('click');
}

function uploadFile() {
    $('#fileUpload').trigger('click');
}

d3.select("#textureFile").on("change", function(){
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //Files vars
        var uploadFile = this.files[0];
        var filereader = new window.FileReader();

        filereader.onload = function () {
            $("#scatter").css("background-image", "url(" +filereader.result + ")");
        }
        filereader.readAsDataURL(uploadFile);
    }
});

function populateDropdown(columns, flag, f) {
    var quants = columns;
    isBrain = flag;
    $('#quantities').find('option')
        .remove();
    if (f) {

        $('.selectpicker').selectpicker({
            style: 'btn-info',
            size: 5
        });

    }
    $.each(quants, function(key, value) {
        //var option = '<option value='+value+ ' label='+value.replace("q_", "")+'></option>';
        var option = '<option style="color:black" value="'+value+'">'+value.replace("q_", "")+'</option>';
        $('#quantities')
            .append(option);
        $("#quantities").selectpicker("refresh");
    });
    $("#quantities").selectpicker('val', quants[0]);
    $("#quantities").selectpicker("refresh");
}

function populateCuttingPlanes(planes) {

    $('#cutPlanes').find('option')
        .remove();
        $('.selectpicker').selectpicker({
            style: 'btn-info',
            size: 5
        });
    $.each(planes, function(key, value) {
        //var option = '<option value='+value+ ' label='+value.replace("q_", "")+'></option>';
        var option = '<option style="color:black" value="'+value+'">'+value+'</option>';
        $('#cutPlanes')
            .append(option);
        $("#cutPlanes").selectpicker("refresh");
    });
    $("#cutPlanes").selectpicker('val', planes[0]);
    $("#cutPlanes").selectpicker("refresh");

}

function orient() {
    getCutPlane(undefined, true);
}

function getCutPlane(cp, orient) {
    /*$("#scatter").empty();
    $("#legend").empty();*/
    //$("#resizeBox").empty();
    var q = cutPlaneSelected;
    /*if (!q) {
        createViz(dataStore, quantitySelected);
        return;
    }*/
   /* var dataGroupByZ = d3.nest()
        .key(function (d) {
            return d.z;
        })
        .entries(dataStore);*/
   if (selectedVizType == "2D") {
       var slice = _.find(dataStore, function (d) {
           return d.key == q;
       })
       initialHide();
       createViz(slice.values, quantitySelected, false, orient);
   } else {
       getQuantity(undefined, true);
   }

}
function determmineVizType(columns) {
    if (_.indexOf(columns, "z")!=-1) {
        is3D = true;
    }
    if (_.indexOf(columns, "directionZ")!=-1) {
        orientedViz = true;
    }

}


