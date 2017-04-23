/*$(function() {
    $('#side-menu').metisMenu();
});*/

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
/*$(function() {
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});*/

var prefNumberSeries = [];
const twoDseries = [1,5,10,50,100,200,500,1000];
var selectedHeight = 40, selectedWidth = 50;
var dataStore={};
var brHeight = window.innerHeight - 54;
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

function readData() {
    $("#legendDiv").hide();
    $("#scatter").hide();
    d3.csv("spinVSpos.csv", function(error, data) {
        if (error) throw error;
        var columns = filterQuantities(data.columns);
        populateDropdown(columns);
        data = selectRandom1000(data);
        dataStore = data;
        createViz(data, quantitySelected);
    });
}

function selectRandom1000(data) {
    var data1 = [];
    for (i=0; i<100; i++) {
        data1[i] = data[Math.round(Math.random()*500000)];
    }
    return createsampleVals(data1);

}

function createViz(data, val) {

    var svg = d3.select("#scatter").attr("height", brHeight).call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    })).append("g");
    var margin = {top: 5, right: selectedWidth, bottom: selectedHeight, left: 25},
        width = $("#scatterDiv").width(),
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

    g.append("g")
        .call(d3.axisBottom(x)).attr("transform", "translate(0,584)");
    g.append("g")
        .call(d3.axisLeft(y).ticks(9));

        data = _.sortBy(data, function(item) {
            return parseFloat(item[val]);
        });
       draw(data.reverse(), g, x, y, val);
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

function draw(data, g,x, y, val) {
    var min = d3.min(data, function (d) {
        return parseFloat(d[val]);
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
        var dmnsn = getDimensions(item[val]* scaleFactor, groups, ratio);
        g./*selectAll("rect").
        data(data1).enter().*/
        append("rect").
        /*attr("x", x(item.x) - dmnsn.width/2).
        attr("y", y(item.y) - dmnsn.height/2).*/
        attr("x", x(item.x) ).
        attr("y", y(item.y) ).
        attr("width", dmnsn.width).
        attr("stroke", '#f5f5f5').
        attr("fill", markerFillClr).
        attr("fill-opacity", 1).
        attr("stroke-width", '.4').
        attr("stroke-opacity", '.5').
        attr("height", dmnsn.height)/*.attr("transform", "translate(" +x(item.x)+","+y(item.y) +") rotate(10)")*/
    })
    $("#legendDiv").show();
    $("#scatter").show();
}

function normalizeExtremes(num) {
    var tens = 0;var norm=0;
    while(num > 10) {
        num = parseInt(num/10);
        tens++;

    }

    if (num >=2 && num<5) {
        norm = 5 * Math.pow(10, tens);
    } else if (num >=0 && num<2) {
        norm = 2 * Math.pow(10, tens);
    } else {
        norm = 10 * Math.pow(10, tens);
    }
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
    drawResizeBox();
    //var g = d3.select("#legend").attr("height", brHeight - $("#resizeBox").height() - 5).append("g");
    var g = d3.select("#legend").attr("height", brHeight - 180).
    attr("width", 370).append("g");
    var h=0;
    for (i=1; i<=4; i++) {
        var w=5, height=selectedHeight*i/4;
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
                g.append("text")
                    .attr("x", w-3)
                    .attr("y", h+selectedHeight +10)
                    .attr("dy", ".35em")
                    .text(convertLabel(parseInt(prefNumberSeries[j]*height*(scalingRatio))));
                w+=  prefNumberSeries[j] +40;
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

function convertLabel(num) {
    if (num >= 1000) {
        if (isInt(num/1000)) {
            return (num/1000) + "K";
        } else {
            return (num/1000).toFixed(1) + "K";
        }
    } else if (num >= 1000000) {
        if (isInt(num/1000000)) {
            return (num/1000000) + "M";
        } else {
            return (num/1000).toFixed(1) + "M";
        }
    } else {
        return num;
    }
}

function isInt(n) {
    return n % 1 === 0;
}

function drawResizeBox() {
    var R = Raphael("resizeBox", 100, 100),
        c = R.rect(0, 0, selectedWidth, selectedHeight).attr({
            fill: markerFillClr,
            stroke: "none",
            opacity: 1,
            cursor: "move"
        }),
        s = R.rect(selectedWidth -40 , selectedHeight-40, 40, 40).attr({
            fill: markerFillClr,
            stroke: "none",
            opacity: 1
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
            if (this.box.attr("height") > 100) {
                this.box.attr("height", 100);
            }

            if (this.box.attr("width") > 100) {
                this.box.attr("width", 100);
            }
            selectedHeight = this.box.attr("height");
            selectedWidth = this.box.attr("width");
            $("#scatter").empty();
            $("#legend").empty();
            $("#resizeBox").empty();
            createViz(dataStore, quantitySelected);
            //alert(+ "," + );
        };
    // rstart and rmove are the resize functions;
    //c.drag(move, start, up);
    c.sizer = s;
    s.drag(rmove, rstart, rend);
    s.box = c;

}

function threeD() {
    selectedHeight= 100;
    selectedWidth = 50;
    prefNumberSeries = threeDSeries;
    $("#container").empty();
    create3dViz(dataStore);
    $("#map").hide();
    $("#scatterDiv").hide();
    $("#resizeBox").hide();
    $("#resizeBoxText").hide();
    $("#legendContainer").height("590");
    $("#container").show();
}

function twoD() {
    selectedHeight= 50;
    selectedWidth = 50;
    prefNumberSeries = twoDseries;
    $("#scatter").empty();
    $("#legend").empty();
    $("#resizeBox").empty();
    $("#map").hide();
    $("#container").hide();
    createViz(dataStore, quantitySelected);
    $("#scatterDiv").show();
    $("#resizeBox").show();
    $("#resizeBoxText").show();

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
        selectedHeight= 50;
        selectedWidth = 50;
        prefNumberSeries = twoDseries;
        quantitySelected = quantity;
        createVizFromFile(data, quantitySelected);
    } else if (type == "3D") {
        selectedHeight= 100;
        selectedWidth = 50;
        prefNumberSeries = threeDSeries;
        threeD();
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

        filereader.onload = function (e) {
            //Txt file output
            var txtRes = filereader.result;
            try {
                if (name.split(".")[1] == "csv") {
                    var data = d3.csvParse(txtRes);
                    var columns = filterQuantities(data.columns);
                    populateDropdown(columns);
                    determmineVizType(data.columns);
                    vizRouter("2D", false, data, columns[0]);
                } else {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {type : 'binary'});
                    brainData = {};
                    var columns = [];
                    workbook.SheetNames.forEach(function(sheetName){
                        if (sheetName == "Age") {
                            return;
                        }
                        // Here is your object
                        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        //var json_object = JSON.stringify(XL_row_object);
                        brainData[sheetName] = XL_row_object;
                        columns.push(sheetName);
                    })
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
    dataStore = dataGroupByZ[0].values;
    $("#scatter").empty();
    $("#legend").empty();
    $("#resizeBox").empty();
    $("#map").hide();
    $("#container").hide();
    //quantitySelected = 'q_magnitude';
    //quantitySelected = $("#quantities").val()[0];
    createViz(dataStore, q);
    $("#scatterDiv").show();
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

function populateDropdown(columns, flag) {
    var quants = columns;
    isBrain = flag;
    $('#quantities').find('option')
        .remove();
    $.each(quants, function(key, value) {
        var option = '<option value='+value+ ' label='+value.replace("q_", "")+'></option>';
        $('#quantities')
            .append(option);
    });
}

function determmineVizType(columns) {
    if (_.indexOf(columns, "z")!=-1) {
        is3D = true;
    }
    if (_.indexOf(columns, "directionZ")!=-1) {
        orientedViz = true;
    }

}

function getQuantity(quant) {
    var q = $("#quantities").val()
    quantitySelected = q.join(",");
    alert(quantitySelected);
}
